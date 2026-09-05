output "app_url" {
  description = "Open this once the instance finishes booting (a couple of minutes after apply; if domain_name is set, HTTPS can take a bit longer for the certbot step)."
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "http://${aws_eip.this.public_ip}:5173"
}

output "api_url" {
  value = var.domain_name != "" ? "https://${var.domain_name}/api" : "http://${aws_eip.this.public_ip}:8080"
}

output "ssh_command" {
  value = "ssh ec2-user@${aws_eip.this.public_ip}"
}

output "public_ip" {
  description = "Stable Elastic IP — doesn't change across terraform applies."
  value       = aws_eip.this.public_ip
}
