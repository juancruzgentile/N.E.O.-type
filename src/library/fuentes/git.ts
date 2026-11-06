import type { FuentesTema } from "./tipos";

const G = (c: string) => `https://git-scm.com/docs/git-${c}`;
export const git: FuentesTema = {
  version: "Git 2.5x",
  entradas: {
    "git init y git clone": [G("init")],
    "git config": [G("config")],
    "git status y git diff": [G("status")],
    "git add y git commit": [G("commit")],
    "git push y git pull": [G("pull")],
    "git log": [G("log")],
    "git switch y git branch": [G("switch"), "Git 2.23"],
    "git merge": [G("merge")],
    "git restore": [G("restore"), "Git 2.23"],
    "git revert": [G("revert")],
    "git stash": [G("stash")],
    "git fetch y remotos": [G("fetch")],
    "git rebase": [G("rebase")],
    "git cherry-pick": [G("cherry-pick")],
    "git reset": [G("reset")],
    "git reflog": [G("reflog")],
    "git bisect": [G("bisect")],
    "git tag": [G("tag")],
  },
};
