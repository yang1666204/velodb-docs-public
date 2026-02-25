import subprocess
import re
import os
from typing import List
from urllib.parse import urlparse

IMAGE_EXTS = (".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".avif")
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEADLINK_OUTPUT = os.path.abspath(
    os.path.join(SCRIPT_DIR, "../../deadlink.txt")
)

deadlinks: List[str] = []


def strip_fenced_code_blocks(md: str) -> str:
    fence_pattern = re.compile(
        r"""
        (^|\n)
        [ \t]*
        (`{3,}|~{3,})
        [^\n]*\n
        .*?
        \n[ \t]*\2
        """,
        re.DOTALL | re.VERBOSE,
    )
    return fence_pattern.sub("\n", md)


def get_changed_files() -> dict:
    """
    Parse `git diff --name-status` from working tree
    """
    result = subprocess.check_output(
        ["git", "diff", "--name-status"],
        text=True,
    )

    # 额外获取未跟踪文件（相当于新增）
    untracked = subprocess.check_output(
        ["git", "ls-files", "--others", "--exclude-standard"],
        text=True,
    ).splitlines()

    changes = {"added": set(), "modified": set(), "deleted": set(), "renamed": {}}

    for line in result.splitlines():
        parts = line.split("\t")
        status = parts[0]

        if status.startswith("R"):
            changes["renamed"][parts[1]] = parts[2]
        elif status == "D":
            changes["deleted"].add(parts[1])
        elif status == "A":
            changes["added"].add(parts[1])
        elif status == "M":
            changes["modified"].add(parts[1])

    # 将未跟踪文件并入 added 集合
    for f in untracked:
        if f:
            changes["added"].add(f)

    return changes


def find_md_files_to_check(changes) -> List[str]:
    files = set()

    for group in ["added", "modified"]:
        for f in changes[group]:
            if f.endswith((".md", ".mdx")):
                files.add(f)

    return list(files)


def process_md_file(file_path: str, deleted_files: set):
    link_pattern = re.compile(r"\[.*?\]\((.*?)\)")

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    content_without_code = strip_fenced_code_blocks(content)
    links = link_pattern.findall(content_without_code)

    for link in links:
        if link.startswith("#"):
            continue

        if link.lower().endswith(IMAGE_EXTS):
            continue

        if urlparse(link).scheme or os.path.isabs(link):
            continue

        # 移除锚点部分（# 及其后面的内容），只保留文件路径部分
        link_path = link.split("#")[0]
        
        full_path = os.path.normpath(os.path.join(os.path.dirname(file_path), link_path))
        print(f"DEBUG link resolve: {file_path} -> {link} -> {full_path}")
        
        if not full_path.endswith((".md", ".mdx")):
            full_path += ".md"
        if full_path in deleted_files:
            deadlinks.append(
                f"[DELETED] {file_path} -> {link}"
            )
        elif not os.path.exists(full_path):
            deadlinks.append(
                f"[NOT FOUND] {file_path} -> {link}"
            )


def main():
    changes = get_changed_files()
    # 将 renamed 的旧路径也视为已删除，以便检测指向旧路径的链接
    deleted_files = set(changes["deleted"]) | set(changes["renamed"].keys())

    files_to_check = find_md_files_to_check(changes)

    print("📄 Markdown files to check:")
    for f in files_to_check:
        print(f"  - {f}")

    for f in files_to_check:
        if os.path.exists(f):
            process_md_file(f, deleted_files)

    print(f"DEBUG link resolve: {deadlinks}")
    # 覆盖写 deadlink.txt
    with open(DEADLINK_OUTPUT, "w", encoding="utf-8") as f:
        for line in deadlinks:
            f.write(line + "\n")



if __name__ == "__main__":
    main()
