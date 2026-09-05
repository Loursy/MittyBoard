# The cheapest possible way to get this app live: one small EC2 box running
# the same docker-compose.yml you already tested locally (postgres + backend
# + frontend, all on one machine). No ALB, no separate RDS, no ECS/Fargate —
# those cost real money regardless of free tier. This does not.

data "aws_ssm_parameter" "al2023_ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

data "aws_vpc" "default" {
  default = true
}

resource "aws_key_pair" "this" {
  key_name   = "${var.project_name}-key"
  public_key = var.ssh_public_key
}

resource "aws_security_group" "this" {
  name        = "${var.project_name}-ec2"
  description = "SSH + app ports for the single-instance deployment"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  ingress {
    description = "Frontend"
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Backend API"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP (Let's Encrypt challenge + redirect to HTTPS)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Allocated independently of the instance so its address is already known
# when we render user_data below — no more discovering the public IP at
# boot time via instance metadata (which is what bit us with the IMDSv2
# token requirement). Free while associated with a running instance, and
# it survives `user_data_replace_on_change` instance replacements.
resource "aws_eip" "this" {
  domain = "vpc"
}

resource "aws_instance" "this" {
  ami                    = data.aws_ssm_parameter.al2023_ami.value
  instance_type          = var.instance_type
  key_name               = aws_key_pair.this.key_name
  vpc_security_group_ids = [aws_security_group.this.id]

  root_block_device {
    volume_size = 20 # within the 30GB/month EBS free-tier allowance
    volume_type = "gp3"
  }

  user_data = templatefile("${path.module}/user_data.sh.tftpl", {
    github_repo       = var.github_repo
    db_password       = var.db_password
    jwt_secret_key    = var.jwt_secret_key
    public_ip         = aws_eip.this.public_ip
    domain_name       = var.domain_name
    duckdns_token     = var.duckdns_token
    letsencrypt_email = var.letsencrypt_email
  })
  user_data_replace_on_change = true

  tags = {
    Name = var.project_name
  }
}

resource "aws_eip_association" "this" {
  instance_id   = aws_instance.this.id
  allocation_id = aws_eip.this.id
}
