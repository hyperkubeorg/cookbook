const n=`# Cluster Ingress
Kubernetes relies on ingress controllers to permit access from external traffic to services in the cluster.
The configuration below installs [ingress-nginx](https://kubernetes.github.io/ingress-nginx/), not to be confused with nginx-ingress, a completely different controller.

\`\`\`yaml:ingress-nginx.yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: ingress-nginx

---
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  namespace: ingress-nginx
  name: ingress-nginx
spec:
  interval: 5m
  url: https://kubernetes.github.io/ingress-nginx

---
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  namespace: ingress-nginx
  name: ingress-nginx
spec:
  chart:
    spec:
      chart: ingress-nginx
      sourceRef:
        kind: HelmRepository
        name: ingress-nginx
      version: ~4.13.0
  dependsOn: []
  interval: 5m
  releaseName: ingress-nginx
  upgrade:
    remediation:
      remediateLastFailure: true
  values:
    controller:
      ingressClassResource:
        default: true
        enabled: true
      prometheus:
        enabled: true
      replicaCount: 2
      service:
        enabled: true
        type: LoadBalancer

\`\`\`

## Automatic SSL Certificates with LetsEncrypt & Cert Manager
See the [Certificate Management](certificate-management.md) document for the issuer setup.

\`\`\`yaml:your-ingress.yaml
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  namespace: YOUR-APPLICATION-NAMESPACE
  name: YOUR-INGRESS-NAME
  annotations:
    # cert-manager.io/issuer: "letsencrypt-staging"
    cert-manager.io/issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - example.example.com
    secretName: YOUR-INGRESS-NAME-example-tls
  rules:
  - host: example.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: YOUR-SERVICE-NAME
            port:
              number: 80
\`\`\``;export{n as default};
