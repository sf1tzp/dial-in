lint:
    npm run lint

format:
    npm run format

secrets-local:
    sops -d secrets/local.env > .env

edit-secrets HOST:
    sops secrets/{{HOST}}.env

build HOST:
    #!/usr/bin/env bash
    set -euo pipefail
    sops -d secrets/{{HOST}}.env > .env
    ~/.local/bin/nerdctl build . -t dial-in:latest
    rm .env
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

bounce HOST:
    #!/usr/bin/env bash
    set -euo pipefail
    ssh {{HOST}} -C "~/.local/bin/nerdctl compose -f ~/dial-in-compose.yaml down"
    ssh {{HOST}} -C "~/.local/bin/nerdctl compose -f ~/dial-in-compose.yaml up -d --env-file ~/dial-in/.env"

generate-migration HOST:
    #!/usr/bin/env bash
    set -euo pipefail
    sops -d secrets/{{HOST}}.env > .env
    source .env
    export DATABASE_URL="postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD}@${POSTGRES_HOST:-localhost}:${POSTGRES_PORT:-5432}/${POSTGRES_DB:-dial-in}"
    npm run db:generate
    rm .env

apply-migrations HOST:
    #!/usr/bin/env bash
    set -euo pipefail
    sops -d secrets/{{HOST}}.env > .env
    source .env
    export DATABASE_URL="postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD}@${POSTGRES_HOST:-localhost}:${POSTGRES_PORT:-5432}/${POSTGRES_DB:-dial-in}"
    npm run db:migrate
    rm .env
