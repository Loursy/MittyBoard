variable "aws_region" {
  description = "AWS region to deploy into."
  type        = string
  default     = "eu-central-1"
}

variable "project_name" {
  description = "Short name used as a prefix for all resources."
  type        = string
  default     = "mittyboard"
}

variable "db_password" {
  description = "Password for the RDS Postgres master user. Pass via TF_VAR_db_password / a tfvars file that is never committed."
  type        = string
  sensitive   = true
}

variable "jwt_secret_key" {
  description = "Base64 HMAC secret for signing JWTs. Generate with: openssl rand -base64 48"
  type        = string
  sensitive   = true
}

variable "backend_image" {
  description = <<-EOT
    Full backend image URI (ECR repo + tag) to deploy. The ECR repo this
    project creates doesn't exist yet on a first apply, so this defaults to
    a public placeholder just so the ECS service can start; the CI deploy
    workflow overwrites it with the real image on every push to main.
  EOT
  type        = string
  default     = "public.ecr.aws/nginx/nginx:1.27-alpine"
}

variable "frontend_image" {
  description = "Full frontend image URI (ECR repo + tag) to deploy. See backend_image for why the default is a placeholder."
  type        = string
  default     = "public.ecr.aws/nginx/nginx:1.27-alpine"
}

variable "backend_desired_count" {
  type    = number
  default = 1
}

variable "frontend_desired_count" {
  type    = number
  default = 1
}
