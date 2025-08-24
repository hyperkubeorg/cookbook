# Metrics and Monitoring
The key word you want to remember from this page is "observability".
Setting up systems to detect and alert when problems arise is absolutely critical.
Having a system go down silently leads to lost revenue in many cases, so there is an urgency to knowing about problems that the system could not automatically recover from.

## Repository Configs
The observability stack we have is relatively large.
Various tools are neccesary for a complete stack and at this time this guide makes no mention for Application Performance Monitoring (APM).

What this guide covers is log aggregation and metrics.

Batteries included are:
- [metric-server](https://kubernetes-sigs.github.io/metrics-server/) - A vital component providing CPU and Memory usage metrics for nodes and containers.
- [Prometheus](https://prometheus.io/) - Service for storing and retrieving metrics.
- [Grafana](https://grafana.com/oss/grafana/) - Metrics and monitoring dashboard with support for various data sources.
- [Grafana Loki](https://grafana.com/oss/loki/) - Service for log aggregation and storage.

These batteries are still being evaluated at this time:
- [Grafana Tempo](https://grafana.com/oss/tempo/) - This is Grafana's APM solution.
- [Keda](https://github.com/kedacore/keda) - Primarily documented here due to it's ability to present custom metrics from existing metrics without a ton of custom microservices.

These are the repositories for these components.
```yaml:metrics-helm-repositories.yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: metrics-system

---
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  namespace: metrics-system
  name: metrics-server
spec:
  interval: 5m
  url: https://kubernetes-sigs.github.io/metrics-server

---
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  namespace: metrics-system
  name: prometheus-community
spec:
  interval: 5m
  url: https://prometheus-community.github.io/helm-charts

---
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  namespace: metrics-system
  name: grafana
spec:
  interval: 5m
  url: https://grafana.github.io/helm-charts

---
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  namespace: metrics-system
  name: keda
spec:
  interval: 5m
  url: https://kedacore.github.io/charts
```

## Metrics Server
```yaml:metrics-server.yaml
---
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  namespace: metrics-system
  name: metrics-server
spec:
  chart:
    spec:
      chart: metrics-server
      sourceRef:
        kind: HelmRepository
        name: metrics-server
      version: ~3.13.0
  dependsOn: []
  interval: 5m
  releaseName: metrics-server
  upgrade:
    remediation:
      remediateLastFailure: true
  values:
    # this is necessary for some CNI's like calico and cilium
    # hostNetwork:
    #   enabled: true

    # necessary when cluster CA is not setup correctly, typically in dev
    args:
    - --kubelet-insecure-tls
```

## Prometheus
```yaml:prometheus.yaml
---
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  namespace: metrics-system
  name: prometheus
spec:
  chart:
    spec:
      chart: prometheus
      sourceRef:
        kind: HelmRepository
        name: prometheus-community
      version: ~27.30.0
  dependsOn: []
  interval: 5m
  releaseName: prometheus
  upgrade:
    remediation:
      remediateLastFailure: true
  values:
    alertmanager:
      enabled: true
      persistentVolume:
        enabled: true
        size: 4Gi
    prometheus-node-exporter:
      enabled: true
    server:
      enabled: true
      persistentVolume:
        enabled: true
        size: 12Gi
      retention: 15d
```

## Grafana Dashboard
```yaml:grafana-dashboard.yaml
---
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  namespace: metrics-system
  name: grafana
spec:
  chart:
    spec:
      chart: grafana
      sourceRef:
        kind: HelmRepository
        name: grafana
      version: ~9.3.2
  dependsOn: []
  interval: 5m
  releaseName: grafana
  upgrade:
    remediation:
      remediateLastFailure: true
  values:
    datasources:
    datasources.yaml:
      apiVersion: 1
        plugins: # Modify this section to auto-install plugins on deployment
        - retrodaredevil-wildgraphql-datasource
        datasources:
        - access: proxy
        isDefault: true
        name: Metrics (Prometheus)
        type: prometheus
        url: http://prometheus-server
        - access: proxy
        isDefault: false
        jsonData: {}
        name: Logs (Loki)
        type: loki
        uid: ""
        url: http://loki:3100
        version: 1
    sidecar:
      datasources:
        enabled: true
        label: grafana_datasource
        labelValue: "true"
        maxLines: 1000
```

## Grafana Loki
```yaml:grafana-loki.yaml
---
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  namespace: metrics-system
  name: loki
spec:
  chart:
    spec:
      chart: loki-stack
      sourceRef:
        kind: HelmRepository
        name: grafana
      version: ~2.10.2
  dependsOn: []
  interval: 5m
  releaseName: loki
  upgrade:
    remediation:
      remediateLastFailure: true
  values:
```

## Grafana Tempo
```yaml:grafana-temp.yaml
---
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  namespace: metrics-system
  name: loki
spec:
  chart:
    spec:
      chart: tempo
      sourceRef:
        kind: HelmRepository
        name: grafana
      version: ~1.23.3
  dependsOn: []
  interval: 5m
  releaseName: tempo
  upgrade:
    remediation:
      remediateLastFailure: true
  values:
```

## Keda
```yaml:keda.yaml
---
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  namespace: metrics-system
  name: keda
spec:
  chart:
    spec:
      chart: keda
      sourceRef:
        kind: HelmRepository
        name: keda
      version: ~2.17.2
  dependsOn: []
  interval: 5m
  releaseName: keda
  upgrade:
    remediation:
      remediateLastFailure: true
  values:
```