const e=`sections:
  - title: Blog
    type: link
    path: /blog/
    showDivider: false
  - title: Application Development
    type: section
    showDivider: true
    exclude: true
    items:
      - id: backend-setup
        label: Backend Setup
      - id: frontend-setup
        label: Frontend Setup
      - id: fullstack-development
        label: Fullstack Development
      - id: containerization
        label: Containerization
  - title: Infrastructure Operations
    type: section
    showDivider: true
    items:
      - id: overview
        label: Overview
      - id: kubernetes
        label: Kubernetes
      - id: continuous-delivery
        label: Continuous Delivery
      - id: kubernetes-dashboard
        label: Dashboard
      - id: certificate-management
        label: Certificate Management
      - id: cluster-ingress
        label: Cluster Ingress
      - id: secrets-management
        label: Secrets Management
      - id: metrics-and-monitoring
        label: Metrics and Monitoring
      - id: file-storage
        label: File Storage
      - id: database
        label: Database
      - id: policy-enforcement
        label: Policy Enforcement
      - id: backups
        label: Backups
        exclude: true
  - title: Support
    type: section
    showDivider: true
    items:
      - id: contributing
        label: Contributing
        exclude: false
      - id: need-help
        label: Need Help?
settings:
  autoGenerateLabels: true
  sortItems: false
  showEmptySections: false
  basePath: /
  landingPage: /overview/
  github:
    enabled: true
    repo: hyperkubeorg/cookbook
    branch: 1fc738cb
`;export{e as default};
