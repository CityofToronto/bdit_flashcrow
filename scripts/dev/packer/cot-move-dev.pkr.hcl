source "vagrant" "cot_move_dev" {
  box_version  = "1.2.1"
  communicator = "ssh"
  output_dir   = "cot-move-dev"
  provider     = "virtualbox"
  source_path  = "bento/amazonlinux-2"
}

build {
  sources = ["source.vagrant.cot_move_dev"]

  provisioner "shell" {
    script = "provision-vm-packer.sh"
  }
}
