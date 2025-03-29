# Array of Kubernetes YAML files to apply
$files = @(
    "backend-deployment.yaml",
    "collab-service-deployment.yaml",
    "matching-service-api-deployment.yaml",
    "matching-service-deployment.yaml",
    "nginx-deployment.yaml",
    "formatter-deployment.yaml",
    "formatter-service.yaml",
    "peerprep-deployment.yaml",
    "rabbitmq-statefulset.yaml",
    "redis-statefulset.yaml",
    "storage-blob-api-deployment.yaml",
    "user-service-deployment.yaml",
    "inbound-gateway-deployment.yaml"
)

# Loop through each file and apply it using kubectl
foreach ($file in $files) {
    Write-Output "Applying $file..."
    kubectl apply -f $file
}

Write-Output "All files applied."
