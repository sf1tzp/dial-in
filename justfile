lint:
    npm run lint &2> lint.log

format:
    npm run format

secrets-local:
    sops -d secrets/local.env > .env

edit-secrets HOST:
    sops secrets/{{HOST}}.env

build:
    #!/usr/bin/env bash
    set -euo pipefail
    ~/.local/bin/nerdctl build . -t dial-in:latest
    ~/.local/bin/nerdctl save dial-in:latest -o dial-in-latest.tar

deploy HOST:
    #!/usr/bin/env bash
    set -euo pipefail
    ssh {{HOST}} -C "mkdir -p ~/images"
    ssh {{HOST}} -C "mkdir -p ~/caddyfiles"
    ssh {{HOST}} -C "mkdir -p ~/dial-in"
    sops -d secrets/{{HOST}}.env | ssh {{HOST}} "cat > ~/dial-in/.env"
    scp caddyfiles/{{HOST}} {{HOST}}:~/caddyfiles/dial-in.caddy
    scp dial-in-compose.yaml {{HOST}}:~/dial-in-compose.yaml
    scp dial-in-latest.tar {{HOST}}:~/images/dial-in-latest.tar
    ssh {{HOST}} -C "~/.local/bin/nerdctl load -i ~/images/dial-in-latest.tar"
    ssh {{HOST}} -C "~/.local/bin/nerdctl compose -f ~/dial-in-compose.yaml down"
    ssh {{HOST}} -C "~/.local/bin/nerdctl compose -f ~/dial-in-compose.yaml up -d --env-file ~/dial-in/.env"

deploy-prod HOST TAG:
    #!/usr/bin/env bash
    set -euo pipefail
    IMAGE="gitea.zen.lofi/sfi/dial-in:{{TAG}}"
    ssh {{HOST}} -C "mkdir -p ~/caddyfiles ~/dial-in"
    scp caddyfiles/{{HOST}} {{HOST}}:~/caddyfiles/dial-in.caddy
    sops -d secrets/{{HOST}}.env | ssh {{HOST}} "cat > ~/dial-in/.env"
    scp dial-in-compose.yaml {{HOST}}:~/dial-in-compose.yaml
    ssh {{HOST}} -C "~/.local/bin/nerdctl pull $IMAGE"
    ssh {{HOST}} -C "DIAL_IN_IMAGE=$IMAGE ~/.local/bin/nerdctl compose -f ~/dial-in-compose.yaml --env-file ~/dial-in/.env down"
    ssh {{HOST}} -C "DIAL_IN_IMAGE=$IMAGE ~/.local/bin/nerdctl compose -f ~/dial-in-compose.yaml --env-file ~/dial-in/.env up -d"

bounce HOST:
    #!/usr/bin/env bash
    set -euo pipefail
    ssh {{HOST}} -C "~/.local/bin/nerdctl compose -f ~/dial-in-compose.yaml down"
    ssh {{HOST}} -C "~/.local/bin/nerdctl compose -f ~/dial-in-compose.yaml up -d --env-file ~/dial-in/.env"

generate-migration HOST:
    #!/usr/bin/env bash
    set -euo pipefail
    sops -d secrets/{{HOST}}.env > .env
    npm run db:generate
    rm .env

apply-migrations HOST:
    #!/usr/bin/env bash
    set -euo pipefail
    sops -d secrets/{{HOST}}.env > .env
    npm run db:migrate
    rm .env
