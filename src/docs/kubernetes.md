# Kubernetes Development
[Kubernetes in Docker (kind)](https://kind.sigs.k8s.io/) is a tool for running Kubernetes locally.
It can be used for most testing.

Simply running `kind create cluster` out of the box will create a single node cluster to develop with.
This is great until you need to control what nodes workloads are deployed on with [Taints and Tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/).
In production, you would want to use this functionality to ensure high-availability of your applications.

A multi-zonal cluster can be simulated with the following configuration.
```yaml:~/.kind.yaml
---
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
  labels:
    topology.kubernetes.io/region: us-nowhere-1
    topology.kubernetes.io/zone: us-nowhere-1a
    settings.cluster.local/lvm-storage-pool: "enabled"
- role: worker
  labels:
    topology.kubernetes.io/region: us-nowhere-1
    topology.kubernetes.io/zone: us-nowhere-1b
    settings.cluster.local/lvm-storage-pool: "enabled"
- role: worker
  labels:
    topology.kubernetes.io/region: us-nowhere-1
    topology.kubernetes.io/zone: us-nowhere-1c
    settings.cluster.local/lvm-storage-pool: "enabled"
- role: worker
  labels:
    topology.kubernetes.io/region: us-nowhere-1
    topology.kubernetes.io/zone: us-nowhere-1d
```

The kind command to initialize this cluster is as follows.
```bash
kind create cluster --config ~/.kind.yml
```

Maintaining an alias in your terminal config may prove worth-while for scrapping old clusters and iterating quickly.
This opens up the ability to just run `kind-reset` to start with a fresh cluster.
```bash
kind-reset='kind delete cluster && kind create cluster --config ~/.kind.yml'
```