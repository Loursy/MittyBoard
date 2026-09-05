output "app_url" {
  description = "Open this once the instance finishes booting (a couple of minutes after apply)."
  value       = "http://${aws_instance.this.public_ip}:5173"
}

output "api_url" {
  value = "http://${aws_instance.this.public_ip}:8080"
}

output "ssh_command" {
  value = "ssh ec2-user@${aws_instance.this.public_ip}"
}

output "public_ip" {
  value = aws_instance.this.public_ip
}
