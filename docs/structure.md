# 项目架构

<img width="700" alt="image" src="https://github.com/user-attachments/assets/3a8cf78b-82d8-48f9-9f0f-613f0eaf3ed5" />

## 具体细节实现

1. **Dependencies 依赖层选型**

   **技术选型分析：`g2.chart.option` vs `AST(SWC)`**

   通过研究官方源码，发现官方案例中 `api2spec` 的实现是基于 `g2.chart.option()` 完成的。下面是核心实现代码：

   ```ts
   class Chart extends G2Chart {
     options() {
       if (arguments.length !== 0) return super.options(...arguments);
       const options = super.options();
       const { type, children, key, ...rest } = options;
       const topLevel =
         type === "view" && Array.isArray(children) && children.length === 1
           ? { ...children[0], ...rest }
           : { type, children, ...rest };
       return sortKeys(topLevel);
     }
     render() {
       // 触发自定义事件
       const event = new CustomEvent("spec", {
         detail: {
           options: this.options(),
         },
       });
       window.dispatchEvent(event);
       return super.render();
     }
   }
   return { ...rest, Chart };
   ```

   **优势：**

   - 更新迭代更加稳定，当 `G2` API 设计变更时，只需升级依赖即可。
   - 便于扩展浏览器端功能，如 `graph preview` 等特性。

   **局限性：**

   - `g2.chart.option()` 不具备 `spec2api` 的转换能力。

   **最终方案：**

   - 同时采用 `g2.chart.option()` 和 `AST(SWC)` 两种实现。
   - `api2spec`：默认使用 `g2.chart.option()`，同时提供 `AST(SWC)` 转换能力。
   - `spec2api`：完全由 `AST(SWC)` 实现。

2. **`vscode` 插件交互**

   **将会实现以下两种交互方式：**

   - **右键菜单操作**
     - **场景**：用户在代码文件或选定的代码片段上右键。
     - **功能**：在右键菜单中提供 "Convert to Spec" 或 "Convert to API" 的选项。
     - **实现**：通过 VSCode 的 `context menu` 注册相应的命令，根据光标选中内容进行转换
   - **命令面板操作**
     - **场景**：用户在 VSCode 中打开命令面板 (`Cmd + Shift + P` / `Ctrl + Shift + P`)。
     - **功能**：提供两个命令：
       - `G2: Convert to Spec Mode`
       - `G2: Convert to API Mode`
     - **实现**：用户输入命令后插件对当前选中代码或整个文件执行转换。

3. **浏览器插件 `UI`**

   下面是浏览器插件的 `UI` 视觉设计稿

   <img width="651" alt="image" src="https://github.com/user-attachments/assets/c8ef1ca7-042e-4d4d-9d82-b1bd184869c1" />

   <img width="1425" alt="image" src="https://github.com/user-attachments/assets/c58e6b2b-4ada-4bab-9395-47596fef5616" />

4. **安全性问题**
   - **问题描述：**
     在使用  **`g2.chart.option()`**  方法以实现依赖层时，常常需要在前端动态执行 G2 代码。这种情况下，如果不加以控制，可能会引发代码注入攻击。代码注入攻击可能会导致恶意代码在用户的浏览器中被执行，从而带来安全风险。
   - **解决方法**：
     可以在代码执行之前使用抽象语法树（AST）解析工具（如 SWC）来动态解析和检查字符串代码。通过这种方式，我们仅保留与 G2 相关的代码，将其他可能存在风险的代码过滤出去。这样做不仅提高了代码的安全性，还确保了仅有合法的操作被执行。
