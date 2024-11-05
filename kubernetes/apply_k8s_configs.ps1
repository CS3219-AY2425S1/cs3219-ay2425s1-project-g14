# Array of Kubernetes YAML files to apply
$files = @(
    "backend-deployment.yaml",
    "backend-service.yaml",
    "collab-service-deployment.yaml",
    "collab-service-service.yaml",
    "matching-service-api-deployment.yaml",
    "matching-service-api-service.yaml",
    "matching-service-deployment.yaml",
    "nginx-deployment.yaml",
    "nginx-service.yaml",
    "peerprep-deployment.yaml",
    "peerprep-service.yaml",
    "rabbitmq-service.yaml",
    "rabbitmq-statefulset.yaml",
    "redis-service.yaml",
    "redis-statefulset.yaml",
    "storage-blob-api-deployment.yaml",
    "storage-blob-api-service.yaml",
    "user-service-deployment.yaml",
    "user-service-service.yaml"
)

# Loop through each file and apply it using kubectl
foreach ($file in $files) {
    Write-Output "Applying $file..."
    kubectl apply -f $file
}

Write-Output "All files applied."
