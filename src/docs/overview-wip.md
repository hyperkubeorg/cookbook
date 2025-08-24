# Overview

Welcome to the **Hyperkube Cookbook**!

This website provides an opinionated compendium of knowledge for developing and operating scalable applications.

It covers everything from development to deployment.

## What's Included
- Frontend Development
- Backend Development
- Developing Locally
- Containerization
- Kubernetes Setup
- Continuous Delivery
- Secrets Management
- Metrics and Monitoring
- File Storage
- Database
- Backups

## Just an Opinion
While this guide is prescriptive to a specific fomula, each part is written in a way that you can take the ideas away independent of the other parts.
Our examples provide helm installation with Flux2 specifically, but if you checkout the [Continuous Delivery](continuous-delivery.md) guide which will help you translate the YAML to helm commands.

## The End Goal
The frontend/backend guides can loosely be used for other languages as long as you stick to the idea of the app being stateless and relying on the services such as Yugabyte explained in the database section and distributed S3 compatible storage as described in the storage section.

Should you build for those services, you should end up with a horizontally scalable system architecture where you can just add more replicas+nodes to handle the services.

This cookbook does not bother to take into account constraints of the network you may be using.
Anything performance related is left to the reader to study and figure out how to address.
