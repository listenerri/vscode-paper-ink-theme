# How to release new version

1. Update the version number in `package.json`
2. Update the `CHANGELOG.md`.
3. Commit the changes and push to the repository.
4. Add new tag and push to the repository.
5. Package the extension and publish to marketplace.

```
# Install vsce if you haven't
npm install -g @vscode/vsce

# First time only: log in with a personal access token
vsce login

# Package the extension
vsce package

# Publish to marketplace
vsce publish
# Or upload and update the extension manually in marketplace on:
# https://marketplace.visualstudio.com/manage/publishers/listenerri
```