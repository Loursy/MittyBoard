variable "aws_region" {
  description = "AWS region. Pick one close to you; the free-tier instance-hour allowance is per-account, not per-region."
  type        = string
  default     = "eu-central-1"
}

variable "project_name" {
  type    = string
  default = "mittyboard"
}

variable "instance_type" {
  description = <<-EOT
    t3.micro / t2.micro are the classic AWS free-tier-eligible sizes (750
    hrs/month for 12 months on eligible accounts). t4g.micro (ARM/Graviton)
    is not always free-tier eligible but is noticeably cheaper on-demand if
    your account's free tier has expired or doesn't apply.
  EOT
  type        = string
  default     = "t3.micro"
}

variable "ssh_public_key" {
  description = "Contents of your local public key file (e.g. `cat ~/.ssh/id_ed25519.pub`), so Terraform can create the AWS key pair for you."
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "CIDR allowed to SSH in. Defaults to open — replace with your own IP/32 before using this for anything real."
  type        = string
  default     = "0.0.0.0/0"
}

variable "github_repo" {
  description = "Public GitHub repo the instance clones on boot, as 'owner/repo'."
  type        = string
  default     = "Loursy/MittyBoard"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "jwt_secret_key" {
  description = "Base64 HMAC secret for signing JWTs. Generate with: openssl rand -base64 48"
  type        = string
  sensitive   = true
}
