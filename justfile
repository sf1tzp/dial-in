lint:
    npm run lint

build HOST:
    #!/usr/bin/env bash
    set -euo pipefail
    # fixme: find a better way to manage these env at build time
    cp env/{{HOST}} .env
    ~/.local/bin/nerdctl build . -t dial-in:latest
    # rm .env
    ~/.local/bin/nerdctl save dial-in:latest -o dial-in-latest.tar

deploy HOST:
    #!/usr/bin/env bash
    set -euo pipefail
    ssh {{HOST}} -C "mkdir -p ~/images"
    ssh {{HOST}} -C "mkdir -p ~/caddyfiles"
    ssh {{HOST}} -C "mkdir -p ~/dial-in"
    scp env/{{HOST}} {{HOST}}:~/dial-in/.env
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
