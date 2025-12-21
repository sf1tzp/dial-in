lint:
    npm run lint

test:
    echo "todo"

build:
    ~/.local/bin/nerdctl build . -t dial-in:latest
    ~/.local/bin/nerdctl save dial-in:latest -o dial-in-latest.tar

deploy: # build
    scp dial-in-latest.tar fitz.gg-prod:~/dial-in-latest.tar
    scp dial-in-compose.yaml fitz.gg-prod:~/dial-in-compose.yaml
    ssh fitz.gg-prod -C "~/.local/bin/nerdctl load -i ~/dial-in-latest.tar"
    ssh fitz.gg-prod -C "~/.local/bin/nerdctl compose -f ~/dial-in-compose.yaml down"
    ssh fitz.gg-prod -C "~/.local/bin/nerdctl compose -f ~/dial-in-compose.yaml up -d"

get-image-name:
    printf "dial-in"
