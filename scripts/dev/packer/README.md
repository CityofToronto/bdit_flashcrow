# Packer configuration for dev VM

To generate box:

```bash
cd scripts/dev/packer
packer build cot-move-dev.json

# wait a while
# upload `package.box` to Vagrant Cloud
```
