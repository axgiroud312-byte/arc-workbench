const foundationComponents = [
  ["accordion", "手风琴", "展开一组问题中的任意一项。"],
  ["alert-dialog", "危险操作确认", "执行删除前确认，或取消并保留草稿。"],
  ["aspect-ratio", "固定宽高比", "在 16:9 和 4:3 之间切换，画面随容器调整。"],
  ["breadcrumb", "面包屑导航", "查看当前页面层级，点击上一级返回。"],
  ["button-group", "按钮组", "把相关操作放在一起，切换文字对齐方式。"],
  ["calendar", "日历", "翻看月份，选择一个日期区间。"],
  ["carousel", "轮播", "滑动或按箭头切换项目卡片。"],
  ["chart", "图表", "查看每周运行量，悬停查看明细。"],
  ["combobox", "可搜索下拉框", "输入关键词并选择项目，支持键盘操作。"],
  ["command", "命令面板", "搜索命令，用鼠标或方向键和回车执行。"],
  ["context-menu", "右键菜单", "右键或长按文件，查看可用操作。"],
  ["data-table", "可排序数据表", "筛选 Agent 运行记录，按列排序并翻页。"],
  ["date-picker", "日期选择器", "展开日历并选择日期。"],
  ["direction", "文字方向", "切换从左到右和从右到左的布局。"],
  ["drawer", "抽屉", "打开底部抽屉，向下滑动或点击按钮关闭。"],
  ["form", "校验表单", "提交前检查项目名称，在字段旁显示错误。"],
  ["input-otp", "验证码输入", "输入或粘贴六位数字。"],
  ["kbd", "键盘按键", "展示桌面和移动端说明中常用的快捷键。"],
  ["menubar", "应用菜单栏", "在文件和视图菜单中选择命令。"],
  ["native-select", "原生选择框", "用系统原生控件选择语言。"],
  ["navigation-menu", "站点导航菜单", "查看文档与项目入口，支持键盘导航。"],
  ["pagination", "分页", "按页浏览运行记录。"],
  ["popover", "气泡面板", "在按钮旁显示运行概况。"],
  ["radio-group", "单选组", "在互斥选项中选择一种审批方式。"],
  ["resizable", "可拖动分栏", "拖动中间分隔线，或聚焦后用方向键调整。"],
  ["spinner", "加载指示器", "显示短操作的加载状态。"],
  ["typography", "排版", "统一标题、正文、引用、列表和行内代码。"],
] as const

const references: Partial<Record<string, string>> = {
  drawer: "https://base-ui.com/react/components/drawer",
  form: "https://base-ui.com/react/components/form",
  "input-otp": "https://base-ui.com/react/components/otp-field",
}

const groups = {
  foundationNavigation: [
    "breadcrumb",
    "command",
    "context-menu",
    "menubar",
    "navigation-menu",
    "pagination",
  ],
  foundationForms: [
    "calendar",
    "combobox",
    "date-picker",
    "form",
    "input-otp",
    "native-select",
    "radio-group",
  ],
  foundationFeedback: ["alert-dialog", "drawer", "popover", "spinner"],
} as const

function foundationSection(
  name: string
): keyof typeof groups | "foundationLayout" {
  for (const [section, names] of Object.entries(groups)) {
    if ((names as readonly string[]).includes(name))
      return section as keyof typeof groups
  }
  return "foundationLayout"
}

export const foundationCatalog = foundationComponents.map(
  ([name, title, description]) => ({
    id: "ui-" + name,
    installId: "ui/" + name,
    exportName: name,
    name: title,
    category: "Base",
    section: foundationSection(name),
    description,
    location: "components/ui/" + name,
    path: "src/components/ui/" + name + ".tsx",
    reference:
      references[name] ?? "https://ui.shadcn.com/docs/components/base/" + name,
    previewLocation: "library/foundation/" + name,
  })
)
