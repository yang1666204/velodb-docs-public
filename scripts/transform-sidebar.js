/**
 * Recursively transform sidebar config:
 * - { type: "doc", id: "xxx" }  -> "xxx"
 * - other nodes stay unchanged
 */

function transformSidebar(node) {
    // 如果是数组，递归处理每一项
    if (Array.isArray(node)) {
        return node.map(transformSidebar);
    }
    console.log('node',node);
    
    // 如果是对象
    if (node && typeof node === "object") {
        // 规则：type === 'doc' → 直接返回 id 字符串
        if (node.type === "doc" && node.id) {
            return node.id;
        }

        // 其他对象：浅拷贝后递归处理 items（如果存在）
        const newNode = { ...node };

        if (Array.isArray(node.items)) {
            newNode.items = node.items.map(transformSidebar);
        }

        return newNode;
    }

    // 其他类型（字符串等）原样返回
    return node;
}


const sidebar = require("../enterprise_versioned_sidebars/version-2.1-sidebars.json");

const newSidebar = transformSidebar(sidebar);

console.log(JSON.stringify(newSidebar, null, 2));