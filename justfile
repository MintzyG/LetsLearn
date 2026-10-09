# LetsLearn: one Fumadocs site, many learn-by-building projects.

# List available commands
default:
    @just --list

# Install dependencies
install:
    pnpm install

# Run the docs site in dev mode (http://localhost:3000)
run:
    pnpm dev

# Open the live editor (Fumadocs Studio) on all projects
edit:
    pnpm exec fumadocs-studio

# Run the site and the editor together
work:
    #!/usr/bin/env bash
    trap 'kill 0' EXIT
    pnpm dev & pnpm exec fumadocs-studio & wait

# Build the site for production
build:
    pnpm build

# Serve the static build from out/
start:
    pnpm start

# Lint and type-check
check:
    pnpm lint
    pnpm types:check

# Create a new project root: just new my-project "My Project"
new slug title:
    #!/usr/bin/env bash
    set -euo pipefail
    dir="content/docs/{{slug}}"
    if [ -e "$dir" ]; then echo "$dir already exists" >&2; exit 1; fi
    mkdir -p "$dir"
    printf '{\n  "title": "%s",\n  "description": "",\n  "root": true,\n  "pages": ["index", "..."]\n}\n' "{{title}}" > "$dir/meta.json"
    printf -- '---\ntitle: %s\ndescription: \n---\n\nStart here.\n' "{{title}}" > "$dir/index.mdx"
    echo "created $dir"

# List project roots
projects:
    @grep -l '"root": true' content/docs/*/meta.json | xargs -n1 dirname | xargs -n1 basename

# Remove build output and generated files
clean:
    rm -rf .next .source out
