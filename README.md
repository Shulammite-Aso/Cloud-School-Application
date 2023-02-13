# Best Practices Using and Writing Prometheus Exporters

As Prometheus has become the de facto standard for monitoring software applications in production, the use of Prometheus exporters has also grown over time.

The widespread adoption of Prometheus means that many applications now natively expose Prometheus-style metrics for monitoring. However, some applications are unable to do this, and monitoring these applications requires a Prometheus exporter to collect metrics and transform them to ones that Prometheus can scrape. Prometheus exporters thus bridge the gap between Prometheus and applications that don't export metrics in the Prometheus format.

Prometheus monitoring is most commonly adopted in cloud-native environments. When exporters are used, they're often deployed alongside the application or systems they're scraping.

![Exporters deployed alongside the application in Kubernetes](https://i.imgur.com/d61o18w.png)

This article introduces Prometheus exporters, explains how to properly find and utilize pre-built exporters, and provides some tips, examples, and considerations for building your own exporters.

## Choosing the Right Pre-built Exporters

Deciding which exporters will best suit your use case can be overwhelming, especially if you don't know where to look. Thankfully, there are tools and resources that either help you find exporters according to your needs or provide a curated list of vetted exporters. The Prometheus website itself maintains a [list of recommended exporters](https://prometheus.io/docs/instrumenting/exporters/). On the other hand, [PromCat](https://promcat.io/) matches exporters that most likely fit your use case based on a category you select or filter by.

In addition to utilizing tools and curated lists, it helps to also do your due diligence when deciding upon which exporter to adopt. This includes reading about what metrics the exporter in question exposes. To make the most out of a pre-built exporter, it needs to expose metrics that truly matter to you. After all, the reason you want to monitor and have insight into what is happening in your system is to make decisions that would affect your product or business.

Other things to look for in an exporter include how configurable it is and whether or not the configurable nature of it works in your favor. For example, you may not want an exporter that is too generic. There's also the question of whether or not you're better off building your own custom exporter. It's relatively rare to find a use case for which an exporter does not already exist. However, there are some cases where a custom-built exporter would be the way to go, like if you have third-party software that doesn't have an existing exporter or if you want to collect and export only metrics that are unique to your needs.

## Utilizing Pre-Built Prometheus Exporters

Each exporter exposes its own set of metrics. Therefore, it's important to examine the metrics for every exporter you decide to utilize. Information about metrics is usually found either on the exporter's project page or its documentation page. It's also important to check the documentation for the best way to label each exporter, because proper labels help you gain insight into how much of your resources, such as RAM and CPU, are being used and for which environment.

Determine what states should trigger alerts in your application. States have different degrees of severity, so not every state is a reason for alarm. You should examine your applications to identify critical elements and determine where and when alerts are needed.

In terms of scalability, you're bound to run into problems as your number of exporters increases. With this in mind, it's important to plan how you would scale beforehand. You can learn more about the various ways in which Prometheus can be made reliable and scalable [here](https://source.coveo.com/2021/11/11/prometheus-at-scale/).

## Building Your Own Exporters

In this section, you'll learn how to build an exporter in Python while following best practices. The exporter you'll create will export metrics from a simple [Apache httpd](https://httpd.apache.org/) application server.

### Prerequisites

To follow along, you'll need to have [Docker](https://docs.docker.com/engine/install/) and [Prometheus](https://prometheus.io/docs/introduction/first_steps/#downloading-prometheus) installed.

You can clone the project from [this GitHub repo](https://github.com/Shulammite-Aso/http-server). You can build the image with the command `docker build -t apache-website .` and run the container with `docker run -d --name apache-website-01 -p 80:80 apache-website`. After you run the container, you should be able to see the sample page that is served on [http://localhost:80/](http://localhost:80/):

![Sample application](https://i.imgur.com/9ECJrCC.png)

**Note**: For simplicity, the exporter you're building here is not customizable.

To start, create a Python project or simply a directory where you'll write your exporter. For this example, the directory will be named `httpd-exporter`. Inside this directory, create a `__main__.py` file with the following code, which imports all the dependencies you need for the project:

```py
import requests
import time
from prometheus_client import start_http_server
from prometheus_client.core import GaugeMetricFamily, CounterMetricFamily, REGISTRY
```

In the following steps, you'll collect metrics from the application you're monitoring (in this case, an httpd application server), convert the collected metrics to the type of metrics that Prometheus understands, and lastly, expose the metrics on an endpoint.

### Collecting Metrics from the Monitored App

Applications that you would write an exporter for will expose metrics through different methods. It could be through an application log file or through an endpoint. So, the first step that your exporter needs to take is to collect these metrics from where they can be found. In the case of an httpd application server, the metrics you're interested in can be found at the `/server-status/?auto` path of the port httpd is running on. If you ran the base application as instructed earlier, the URL in your case would be `http://localhost:80/server-status/?auto`:

![httpd server metrics](https://i.imgur.com/rOl8aWJ.png)

After reviewing the metrics exposed there, you can collect them by making a GET request to the URL. The following code makes this request in Python:

```py
APP_URL = "http://localhost:80/server-status/?auto"

def get_metrics():
    resp = requests.get(url=APP_URL)
    byte_data = resp.content

    data = str(byte_data, 'UTF-8')

    lines = data.split('\n')

    return lines

def split_pair(pair=""):
    key_and_value = pair.split(':')
    value = key_and_value[1].strip()
    return float(value)
```

If you're familiar with Python, you'll know that the `get_metrics()` function makes a GET request to your server metrics endpoint and returns the result as a list of lines. Each of the lines contains a key-value pair representing metrics. The `split_pair()` function returns the value in the pair.

### Creating Prometheus Metrics

Now that you've collected metrics from the application that you're monitoring, the next step is to create metrics that Prometheus can understand and set their values to the metrics you collected. Prometheus supports four core [metric types](https://prometheus.io/docs/concepts/metric_types/): counter, gauge, histogram, and summary.

You can convert all the exposed metrics to suitable Prometheus metric types, or you can focus on the metrics that are most important to you or your business. In this example, you'll write code to convert three application metrics to ones that Prometheus can scrape. To achieve this, you'll implement a custom collector that creates a new metric each time there's a scrape. When writing an exporter, rather than following the usual direct instrumentation approach of creating a metric globally, you'll always need to implement a custom collector and then update it on each scrape.

For example, in direct instrumentation, you would write:

```py
from prometheus_client import Gauge
gauge = Gauge('gauge_name', 'gauge description')

# code to get gauge value here
gauge.set(gauge_value)
```

However, in an exporter, you would write:

```py
from prometheus_client.core import GaugeMetricFamily, REGISTRY

class CustomCollector(object):
    def collect(self):
        yield GaugeMetricFamily('my_gauge', 'Help text', value=gauge_value)

REGISTRY.register(CustomCollector())
```

Proceed by adding the following code to your `__main__.py` file:

```py
class CustomCollector(object):
    def __init__(self):
        pass

    def collect(self):
        lines = get_metrics()
        for i in lines:
            if "ServerUptimeSeconds" in i:
                v = split_pair(i)
                yield CounterMetricFamily('httpd_server_uptime', 'How long the application server has been up', value=v)
            elif "CPULoad" in i:
                v = split_pair(i)
                yield GaugeMetricFamily('httpd_server_CPU_load', 'How many requests per second the server is processing', value=v)
```

The code above defines a class called `CustomCollector` and creates two of the three metrics that you want Prometheus to scrape. To better understand what each part of the code is doing, let's analyze one of the items of the for-loop:

```py
            if "ServerUptimeSeconds" in i:
                v = split_pair(i)
                yield CounterMetricFamily('httpd_server_uptime', 'How long the application server has been up', value=v)
```

Within the data returned from the `get_metrics()` function, the line that contains the string `"ServerUptimeSeconds"` holds the value that represents the server uptime of the httpd server you're monitoring. In the first two lines of the code, you programmatically retrieve that value.

Take note of the last line. The Python client library allows custom collectors to create any of the four supported metric types using the `CounterMetricFamily`, `GaugeMetricFamily`, `HistogramMetricFamily`, and `SummaryMetricFamily` functions. In the last line, you create a counter metric with `CounterMetricFamily`, passing it the metric name, help text, and value respectively. Note that the metric name is defined in [snake case](https://en.wikipedia.org/wiki/Snake_case), as this is how Prometheus metrics and label names are written.

When creating your metrics, you should also make sure that their names are not too generic. For example, it's best to prefix a metric name with the name of what the exporter is exporting. Someone who is familiar with Prometheus but not your system should still be able to understand what a metric means.

To create a third metric that has more than one value and that uses labels to categorize the values, change your `CustomCollector` class to the following:

```py
class CustomCollector(object):
    def __init__(self):
        pass

    def collect(self):
        lines = get_metrics()
        server_threads = GaugeMetricFamily('httpd_server_threads', 'Number of workers available on the application server', labels=['worker_state'])
        for i in lines:
            if "ServerUptimeSeconds" in i:
                v = split_pair(i)
                yield CounterMetricFamily('httpd_server_uptime', 'How long the application server has been up', value=v)
            elif "CPULoad" in i:
                v = split_pair(i)
                yield GaugeMetricFamily('httpd_server_CPU_load', 'How many requests per second the server is processing', value=v)
            elif "BusyWorkers" in i:
                v = split_pair(i)
                server_threads.add_metric(['busy'], v)
            elif "IdleWorkers" in i:
                v = split_pair(i)
                server_threads.add_metric(['idle'], v)

        yield server_threads
```

The label name for this third metric is `worker_state`, and it has two variations: `busy` and `idle`. Bear in mind that Prometheus [advises against](https://prometheus.io/docs/instrumenting/writing_exporters/#labels) using labels to put things into one metric just because they share a prefix.

The example code presented up to this point creates three metrics that you want to export; in practice, you'll very likely want to export more. In any case, the same principle you have followed here will apply. You can read more about best practices for writing exporters [here](https://prometheus.io/docs/instrumenting/writing_exporters/).

### Exposing the Endpoint

The final step in completing your exporter is to expose the metrics you've created. The client library makes this very easy to achieve. Add the code below after your collector class:

```py
if __name__ == "__main__":
    start_http_server(8000)
    REGISTRY.register(CustomCollector())
    while True: 
        time.sleep(1)
```

By exposing a port number using `start_http_server` and registering your custom collector, your metrics are ready to be scraped by Prometheus from the `/metrics` endpoint. You can also see them firsthand by visiting the endpoint at [http://localhost:8000/metrics](http://localhost:8000/metrics):

![httpd metrics on Prometheus](https://i.imgur.com/tHHMVzH.png)

Now you can configure Prometheus, run it, and visualize the data. Create a file called `prometheus.yml`. The configuration below tells Prometheus to scrape your exporter's `/metrics` endpoint:

```yaml
global:
  scrape_interval: 5s
  evaluation_interval: 15s 
scrape_configs:
  - job_name: "httpd"
    static_configs:
      - targets: ["localhost:8000"]
```

Run your Prometheus binary from your terminal while passing `--config.file=prometheus.yml` to it:

```
./prometheus --config.file=prometheus.yml
```

You should now see your httpd server metrics on Prometheus's built-in [expression browser](https://prometheus.io/docs/visualization/browser/). Navigate to [http://localhost:9090/graph](http://localhost:9090/graph) and query using any of your metric names. You can switch between the table and graph tabs to see how your data is represented in each format.

Below is a graph for the `httpd_server_CPU_load` query:

![CPU load graph](https://i.imgur.com/VYpAadL.png)

Below is a table for the `httpd_server_threads` query:

![Server thread table](https://i.imgur.com/3Fd5RWS.png)

## Conclusion

In this article, you learned what Prometheus exporters are and how to properly choose exporters that will suit your needs. You saw that there are curated lists of vetted exporters that can save you a lot of time when trying to decide what to adopt. You also learned how to build an exporter of your own using the Python client library, as well as some of the best practices to follow while building one.
