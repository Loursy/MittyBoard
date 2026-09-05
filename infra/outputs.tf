output "alb_dns_name" {
  description = "Public URL for the app once services are running."
  value       = "http://${aws_lb.this.dns_name}"
}

output "backend_ecr_repository_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "frontend_ecr_repository_url" {
  value = aws_ecr_repository.frontend.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.this.name
}

output "rds_endpoint" {
  value     = aws_db_instance.postgres.address
  sensitive = true
}
