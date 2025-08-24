const e=`# Certificate Management
It is practically industry standard to rely on [cert-manager](https://cert-manager.io) at this point. 
The configuration in this guide is for using [Let's Encrypt](https://letsencrypt.org/) with Ingress Nginx.
Let's Encrypt is a free SSL provider that cert-manager supports.
You can maintain your root CA or do various other configs as well, but that's not covered in this guide.

\`\`\`yaml:cert-manager.yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: cert-manager

---
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  namespace: cert-manager
  name: jetstack-io
spec:
  interval: 5m
  url: https://charts.jetstack.io

---
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  namespace: cert-manager
  name: cert-manager
spec:
  chart:
    spec:
      chart: cert-manager
      sourceRef:
        kind: HelmRepository
        name: jetstack-io
      version: ~1.18.0
  dependsOn: []
  interval: 5m
  releaseName: cert-manager
  upgrade:
    remediation:
      remediateLastFailure: true
  values:

\`\`\`


## Configuring Issuers
Note before proceeding, the LetsEncrypt issuer will not work in a local cluster.

In the [Continuous Delivery](continuous-delivery.md) page, we mention the pseudochart package maintained by Hyperkube.
This is used to force dependency order, as the CRDS in the issuer example wont be available until cert-manager is installed.

\`\`\`yaml:lets-encrypt-issuers.yaml
---
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  namespace: YOUR-APPLICATION-NAMESPACE
  name: hyperkubeorg
spec:
  interval: 5m
  url: https://hyperkubeorg.github.io/charts

---
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  namespace: YOUR-APPLICATION-NAMESPACE
  name: letsencrypt-issuers
spec:
  chart:
    spec:
      chart: pseudochart
      sourceRef:
        kind: HelmRepository
        name: hyperkubeorg
      version: ~0.2.0
  dependsOn:
  - namespace: cert-manager
    name: cert-manager
  interval: 5m
  releaseName: letsencrypt-issuers
  upgrade:
    remediation:
      remediateLastFailure: true
  values:
    objects:
    # Let's Encrypt Staging Certificate Issuer
    - apiVersion: cert-manager.io/v1
      kind: Issuer
      metadata:
        name: letsencrypt-staging
      spec:
        acme:
          # The ACME server URL
          server: https://acme-staging-v02.api.letsencrypt.org/directory
          # Email address used for ACME registration
          email: user@example.com
          # The ACME certificate profile
          profile: tlsserver
          # Name of a secret used to store the ACME account private key
          privateKeySecretRef:
            name: letsencrypt-staging
          # Enable the HTTP-01 challenge provider
          solvers:
            - http01:
                ingress:
                  ingressClassName: nginx
    # Let's Encrypt Production Certificate Issuer
    - apiVersion: cert-manager.io/v1
      kind: Issuer
      metadata:
        name: letsencrypt-prod
      spec:
        acme:
          # The ACME server URL
          server: https://acme-v02.api.letsencrypt.org/directory
          # Email address used for ACME registration
          email: user@example.com
          # The ACME certificate profile
          profile: tlsserver
          # Name of a secret used to store the ACME account private key
          privateKeySecretRef:
            name: letsencrypt-prod
          # Enable the HTTP-01 challenge provider
          solvers:
            - http01:
                ingress:
                  ingressClassName: nginx
\`\`\`
`;export{e as default};
