# LetsLearn

One Fumadocs site holding many learn-by-building projects. Each project is a separate root with its own sidebar.

## Commands

Run `just` to list them all.

| Command | What it does |
|---|---|
| `just install` | install dependencies |
| `just run` | docs site at http://localhost:3000 |
| `just edit` | live editor (Fumadocs Studio) at http://localhost:5180 |
| `just work` | site + editor together |
| `just new <slug> "<Title>"` | create a new project root |
| `just projects` | list project roots |
| `just check` | lint + type-check |
| `just build` / `just start` | production build / serve it |

## Layout

```
content/docs/
  <project>/
    meta.json     "root": true makes it a separate sidebar root
    index.mdx     project landing page
    ...           chapters; subfolders get their own meta.json
```

The home page lists every root folder automatically. The editor edits all of `content/docs`, and the dev site hot-reloads what it saves.

## Authoring workflow

- `loop.md`: the generic writer → learner → reviewer loop every project follows
- `agent-bookkeeping.md`: shared log where agents sign off their steps
- `STUCK.md`: shared log of every place the learner got stuck and which nudge helped
- `projects/<name>/<name>.md`: a project's standalone context file (scope, conventions, sections), alongside its material, reviews and code

## License

- **Code** (the site, project code, tests): [MIT](LICENSE)
- **Written content** (`content/`, project material): [CC BY 4.0](LICENSE-CONTENT)

Both are free to use, modify and share, as long as you credit the source. © 2026 Sophia Hoffmann.
