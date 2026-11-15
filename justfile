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

# Lint, type-check, and check the component catalog is up to date
check:
    pnpm lint
    pnpm types:check
    node --no-warnings scripts/catalog.mjs --check

# Regenerate components/book/CATALOG.md from components/book/catalog.ts
catalog:
    node --no-warnings scripts/catalog.mjs

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

# Create a section in a book: just section notwork 02 ethernet "Ethernet"
section book number slug title:
    #!/usr/bin/env bash
    set -euo pipefail
    book="content/docs/{{book}}"
    if [ ! -d "$book" ]; then echo "no book $book (create it with: just new {{book}} \"Title\")" >&2; exit 1; fi
    dir="$book/{{number}}-{{slug}}"
    if [ -e "$dir" ]; then echo "$dir already exists" >&2; exit 1; fi
    mkdir -p "$dir"
    printf '{\n  "title": "%s %s",\n  "pages": ["index", "..."]\n}\n' "{{number}}" "{{title}}" > "$dir/meta.json"
    {
        printf -- '---\ntitle: %s\ndescription: \n---\n\n' "{{title}}"
        printf '%s\n' '{/* The usual order, delete what this section does not need. Every component: components/book/CATALOG.md, or /components on the dev site.' \
            '   The idea (<Idea>), what to build (<Task> with <Spec> entries), the tests (<Terminal>), help (<Hints>),' \
            '   the real world (<ShowOff>), <DoneWhen>, <Recap>, the reference code (<Reference>), extras (<Challenge>, <Deepening>). */}'
    } > "$dir/index.mdx"
    echo "created $dir"

# Read a project's learning material, with answer checking: just material my-book 01
material project section="":
    #!/usr/bin/env bash
    set -euo pipefail
    port="${MATERIAL_PORT:-5190}"
    dir="projects/{{project}}/material"
    if [ ! -d "$dir" ]; then echo "no material in $dir" >&2; exit 1; fi
    path="{{project}}/material/"
    if [ -n "{{section}}" ]; then
        match=$(find "$dir" -mindepth 1 -maxdepth 1 -type d -name "{{section}}-*" | head -n1)
        if [ -z "$match" ]; then echo "no section {{section}} in $dir" >&2; exit 1; fi
        path="{{project}}/material/$(basename "$match")/material.html"
    fi
    url="http://127.0.0.1:$port/$path"
    (sleep 1; xdg-open "$url" >/dev/null 2>&1 || open "$url" >/dev/null 2>&1 || echo "open $url") &
    exec node scripts/material-server.mjs

# List project roots
projects:
    @grep -l '"root": true' content/docs/*/meta.json | xargs -n1 dirname | xargs -n1 basename

# Remove build output and generated files
clean:
    rm -rf .next .source out
