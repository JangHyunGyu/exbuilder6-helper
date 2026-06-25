(function () {
  "use strict";

  var CL_NS = "http://tomatosystem.co.kr/cleopatra";
  var STD_NS = "http://tomatosystem.co.kr/cleopatra/studio";
  var STORAGE_KEY = "exbuilder6-web-ide:v1";
  var VISUAL_TAGS = ["group", "output", "inputbox", "combobox", "dateinput", "textarea", "button", "grid"];

  var state = {
    xmlDoc: null,
    clxFileName: "newScreen.clx",
    jsFileName: "newScreen.js",
    jsSource: "",
    selectedKey: "",
    activeView: "design",
    advancedMode: false,
    dragKey: "",
    nodeMap: new Map(),
    sidIndex: 0
  };

  var els = {};

  document.addEventListener("DOMContentLoaded", function () {
    bindElements();
    bindEvents();
    restoreOrCreate();
  });

  function bindElements() {
    els.fileSummary = document.getElementById("fileSummary");
    els.newScreen = document.getElementById("newScreen");
    els.clxFile = document.getElementById("clxFile");
    els.jsFile = document.getElementById("jsFile");
    els.downloadClx = document.getElementById("downloadClx");
    els.downloadJs = document.getElementById("downloadJs");
    els.toggleAdvanced = document.getElementById("toggleAdvanced");
    els.palette = document.getElementById("palette");
    els.treeView = document.getElementById("treeView");
    els.modelSummary = document.getElementById("modelSummary");
    els.deleteNode = document.getElementById("deleteNode");
    els.viewTabs = Array.prototype.slice.call(document.querySelectorAll("[data-view]"));
    els.viewPanes = Array.prototype.slice.call(document.querySelectorAll("[data-pane]"));
    els.screenSize = document.getElementById("screenSize");
    els.selectedSummary = document.getElementById("selectedSummary");
    els.designCanvas = document.getElementById("designCanvas");
    els.clxSource = document.getElementById("clxSource");
    els.applyClxSource = document.getElementById("applyClxSource");
    els.jsSource = document.getElementById("jsSource");
    els.inspector = document.getElementById("inspector");
    els.inspectorFields = Array.prototype.slice.call(document.querySelectorAll("[data-prop]"));
    els.nodeType = document.getElementById("nodeType");
    els.moveButtons = Array.prototype.slice.call(document.querySelectorAll("[data-move]"));
    els.gridColumnPanel = document.getElementById("gridColumnPanel");
    els.gridColumnEditor = document.getElementById("gridColumnEditor");
    els.addGridColumn = document.getElementById("addGridColumn");
    els.rawXml = document.getElementById("rawXml");
    els.applyRawXml = document.getElementById("applyRawXml");
    els.toast = document.getElementById("toast");
  }

  function bindEvents() {
    els.newScreen.addEventListener("click", function () {
      if (!window.confirm("현재 화면을 버리고 새 화면을 만들까요?")) return;
      loadClx(defaultClx(), "newScreen.clx");
      state.jsSource = defaultJs();
      state.jsFileName = "newScreen.js";
      renderAll();
      persist();
      showToast("새 화면을 만들었습니다.");
    });

    els.clxFile.addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;
      readFile(file, function (text) {
        loadClx(text, file.name);
        renderAll();
        persist();
        showToast(file.name + " 파일을 열었습니다.");
      });
      event.target.value = "";
    });

    els.jsFile.addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;
      readFile(file, function (text) {
        state.jsSource = text;
        state.jsFileName = file.name;
        renderAll();
        persist();
        showToast(file.name + " 파일을 열었습니다.");
      });
      event.target.value = "";
    });

    els.downloadClx.addEventListener("click", function () {
      downloadFile(state.clxFileName || "screen.clx", serializeClx(), "text/xml;charset=utf-8");
    });

    els.downloadJs.addEventListener("click", function () {
      state.jsSource = els.jsSource.value;
      downloadFile(state.jsFileName || baseName(state.clxFileName) + ".js", state.jsSource, "text/javascript;charset=utf-8");
    });

    els.toggleAdvanced.addEventListener("click", function () {
      setAdvancedMode(!state.advancedMode);
      persist();
      showToast(state.advancedMode ? "고급 보기를 켰습니다." : "쉬운 보기로 돌아왔습니다.");
    });

    els.palette.addEventListener("click", function (event) {
      var button = event.target.closest("[data-add]");
      if (!button) return;
      addComponent(button.getAttribute("data-add"));
    });

    els.treeView.addEventListener("click", function (event) {
      var item = event.target.closest("[data-key]");
      if (item) selectNode(item.getAttribute("data-key"));
    });

    els.designCanvas.addEventListener("click", function (event) {
      var node = event.target.closest("[data-key]");
      if (!node || !els.designCanvas.contains(node)) return;
      event.stopPropagation();
      selectNode(node.getAttribute("data-key"));
    });

    els.designCanvas.addEventListener("click", function (event) {
      if (event.target === els.designCanvas) selectNode("");
    });

    els.designCanvas.addEventListener("dragstart", function (event) {
      var node = event.target.closest("[data-key]");
      if (!node || node.getAttribute("data-key") === "0") return;
      state.dragKey = node.getAttribute("data-key");
      node.classList.add("is-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", state.dragKey);
    });

    els.designCanvas.addEventListener("dragover", function (event) {
      var node = event.target.closest("[data-key]");
      if (!node) return;
      event.preventDefault();
      node.classList.add("is-drop-target");
    });

    els.designCanvas.addEventListener("dragleave", function (event) {
      var node = event.target.closest("[data-key]");
      if (node) node.classList.remove("is-drop-target");
    });

    els.designCanvas.addEventListener("drop", function (event) {
      var targetView = event.target.closest("[data-key]");
      var dragKey = event.dataTransfer.getData("text/plain") || state.dragKey;
      clearDragClasses();
      if (!targetView || !dragKey) return;
      event.preventDefault();
      moveByDrop(dragKey, targetView.getAttribute("data-key"));
    });

    els.designCanvas.addEventListener("dragend", clearDragClasses);

    els.deleteNode.addEventListener("click", deleteSelectedNode);

    els.viewTabs.forEach(function (button) {
      button.addEventListener("click", function () {
        setView(button.getAttribute("data-view"));
      });
    });

    els.applyClxSource.addEventListener("click", function () {
      loadClx(els.clxSource.value, state.clxFileName);
      renderAll();
      persist();
      showToast("CLX 소스를 적용했습니다.");
    });

    els.jsSource.addEventListener("input", function () {
      state.jsSource = els.jsSource.value;
      persist();
    });

    els.inspectorFields.forEach(function (field) {
      field.addEventListener("input", function () {
        updateSelectedProperty(field.getAttribute("data-prop"), field.value);
      });
    });

    els.moveButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        moveSelected(button.getAttribute("data-move"));
      });
    });

    els.addGridColumn.addEventListener("click", addGridColumn);

    els.gridColumnEditor.addEventListener("input", function (event) {
      var input = event.target.closest("[data-grid-prop]");
      if (!input) return;
      updateGridColumn(Number(input.getAttribute("data-grid-index")), input.getAttribute("data-grid-prop"), input.value);
    });

    els.gridColumnEditor.addEventListener("click", function (event) {
      var button = event.target.closest("[data-grid-remove]");
      if (!button) return;
      removeGridColumn(Number(button.getAttribute("data-grid-remove")));
    });

    els.applyRawXml.addEventListener("click", applyRawXml);
  }

  function restoreOrCreate() {
    var restored = false;
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        if (saved && saved.clx) {
          loadClx(saved.clx, saved.clxFileName || "newScreen.clx");
          state.jsSource = saved.jsSource || defaultJs();
          state.jsFileName = saved.jsFileName || baseName(state.clxFileName) + ".js";
          state.advancedMode = !!saved.advancedMode;
          restored = true;
        }
      }
    } catch (error) {}

    if (!restored) {
      loadClx(defaultClx(), "newScreen.clx");
      state.jsSource = defaultJs();
      state.jsFileName = "newScreen.js";
    }
    renderAll();
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        clx: serializeClx(false),
        clxFileName: state.clxFileName,
        jsSource: state.jsSource,
        jsFileName: state.jsFileName,
        advancedMode: state.advancedMode
      }));
    } catch (error) {}
  }

  function readFile(file, callback) {
    var reader = new FileReader();
    reader.onload = function () {
      callback(String(reader.result || ""));
    };
    reader.readAsText(file, "utf-8");
  }

  function loadClx(text, fileName) {
    var previousClxFileName = state.clxFileName;
    var shouldFollowClxName = !state.jsFileName || state.jsFileName === "newScreen.js" || state.jsFileName === baseName(previousClxFileName) + ".js";
    var parser = new DOMParser();
    var doc = parser.parseFromString(String(text || ""), "application/xml");
    var error = doc.getElementsByTagName("parsererror")[0];
    if (error) {
      showToast("CLX XML을 읽지 못했습니다.");
      throw new Error(error.textContent || "Invalid XML");
    }
    state.xmlDoc = doc;
    state.clxFileName = sanitizeFileName(fileName || state.clxFileName || "screen.clx", "screen.clx");
    if (shouldFollowClxName) state.jsFileName = baseName(state.clxFileName) + ".js";
    ensureRootGroup();
    state.selectedKey = "";
  }

  function renderAll() {
    if (!state.xmlDoc) return;
    setAdvancedMode(state.advancedMode, true);
    state.nodeMap = new Map();
    renderCanvas();
    renderTree();
    renderModelSummary();
    renderInspector();
    renderGridColumnEditor();
    renderSources();
    renderHeader();
  }

  function renderHeader() {
    els.fileSummary.textContent = (state.clxFileName || "screen.clx") + " / " + (state.jsFileName || "screen.js");
    var screen = getDefaultScreen();
    var width = readLength(screen && (screen.getAttribute("width") || screen.getAttribute("minwidth")), 1280);
    var height = readLength(screen && screen.getAttribute("height"), 720);
    els.screenSize.textContent = width + " x " + height;
    var selected = selectedElement();
    els.selectedSummary.textContent = selected ? describeNode(selected) : "선택 없음";
  }

  function renderCanvas() {
    var root = ensureRootGroup();
    var screen = getDefaultScreen();
    var width = readLength(screen && (screen.getAttribute("width") || screen.getAttribute("minwidth")), 1280);
    var height = readLength(screen && screen.getAttribute("height"), 720);
    els.designCanvas.style.width = width + "px";
    els.designCanvas.style.minHeight = height + "px";
    els.designCanvas.innerHTML = "";
    els.designCanvas.appendChild(renderElement(root, "0", true));
  }

  function renderElement(xmlNode, key, isRoot) {
    state.nodeMap.set(key, xmlNode);

    var tag = localName(xmlNode);
    var view = document.createElement("div");
    view.className = "ex-node ex-" + tag + (state.selectedKey === key ? " is-selected" : "");
    view.setAttribute("data-key", key);
    if (!isRoot) view.setAttribute("draggable", "true");

    if (tag === "group") {
      view.setAttribute("data-label", describeNode(xmlNode));
      applyGroupLayout(view, xmlNode);
      if (isRoot) {
        view.style.border = "0";
        view.style.borderRadius = "0";
        view.style.minHeight = "100%";
      }
      componentChildren(xmlNode).forEach(function (child, index) {
        var childKey = key + "." + index;
        var childView = renderElement(child, childKey, false);
        applyFormData(childView, child);
        view.appendChild(childView);
      });
      return view;
    }

    if (tag === "output") {
      view.textContent = xmlNode.getAttribute("value") || xmlNode.getAttribute("fieldLabel") || xmlNode.getAttribute("id") || "Label";
      return view;
    }

    if (tag === "button") {
      view.textContent = xmlNode.getAttribute("value") || xmlNode.getAttribute("id") || "Button";
      return view;
    }

    if (tag === "grid") {
      renderGrid(view, xmlNode);
      return view;
    }

    if (tag === "textarea") {
      view.classList.add("ex-control", "ex-textarea", "muted");
      view.textContent = xmlNode.getAttribute("fieldLabel") || boundColumn(xmlNode) || "TextArea";
      return view;
    }

    if (tag === "combobox") {
      view.classList.add("ex-control", "muted");
      view.textContent = (xmlNode.getAttribute("fieldLabel") || boundColumn(xmlNode) || "Combo") + "  ▾";
      return view;
    }

    if (tag === "dateinput") {
      view.classList.add("ex-control", "muted");
      view.textContent = xmlNode.getAttribute("fieldLabel") || "YYYY-MM-DD";
      return view;
    }

    if (tag === "inputbox") {
      view.classList.add("ex-control", "muted");
      view.textContent = xmlNode.getAttribute("fieldLabel") || boundColumn(xmlNode) || "Input";
      return view;
    }

    view.className += " unknown-node";
    view.textContent = "<" + tag + ">";
    return view;
  }

  function renderGrid(view, xmlNode) {
    view.innerHTML = "";
    var headers = gridHeaders(xmlNode);
    if (!headers.length) headers = datasetColumns(xmlNode.getAttribute("datasetid")).slice(0, 4);
    if (!headers.length) headers = ["Column1", "Column2", "Column3"];

    var head = document.createElement("div");
    head.className = "ex-grid-head";
    headers.forEach(function (header) {
      var span = document.createElement("span");
      span.textContent = header;
      head.appendChild(span);
    });
    view.appendChild(head);

    for (var row = 0; row < 4; row++) {
      var rowEl = document.createElement("div");
      rowEl.className = "ex-grid-row";
      headers.forEach(function () {
        rowEl.appendChild(document.createElement("span"));
      });
      view.appendChild(rowEl);
    }
  }

  function renderTree() {
    var root = ensureRootGroup();
    var rows = [];
    collectTree(root, "0", 0, rows);
    els.treeView.innerHTML = "";
    rows.forEach(function (row) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "tree-item" + (row.key === state.selectedKey ? " is-selected" : "");
      button.style.paddingLeft = 7 + row.depth * 16 + "px";
      button.setAttribute("data-key", row.key);
      button.innerHTML = '<span class="tag">' + escapeHtml(row.tag) + '</span><span class="name">' + escapeHtml(row.name) + "</span>";
      els.treeView.appendChild(button);
    });
  }

  function collectTree(node, key, depth, rows) {
    state.nodeMap.set(key, node);
    rows.push({ key: key, depth: depth, tag: localName(node), name: describeNode(node) });
    componentChildren(node).forEach(function (child, index) {
      collectTree(child, key + "." + index, depth + 1, rows);
    });
  }

  function renderModelSummary() {
    var items = [];
    getByLocalName("datamap").forEach(function (node) {
      items.push({ type: "DataMap", id: node.getAttribute("id"), count: getChildrenByLocalName(node, "datacolumn").length });
    });
    getByLocalName("dataset").forEach(function (node) {
      items.push({ type: "DataSet", id: node.getAttribute("id"), count: getChildrenByLocalName(node, "datacolumn").length });
    });
    getByLocalName("submission").forEach(function (node) {
      items.push({ type: "Submission", id: node.getAttribute("id"), action: node.getAttribute("action") });
    });

    els.modelSummary.innerHTML = items.length ? items.map(function (item) {
      var detail = item.action || (item.count + " columns");
      return '<div class="model-chip"><strong>' + escapeHtml(item.type + " " + (item.id || "")) + '</strong><span>' + escapeHtml(detail) + "</span></div>";
    }).join("") : '<div class="model-chip"><strong>모델 없음</strong><span>CLX의 model 영역을 읽지 못했습니다.</span></div>';
  }

  function renderInspector() {
    var node = selectedElement();
    var disabled = !node;
    els.nodeType.textContent = node ? localName(node) : "없음";
    els.inspectorFields.forEach(function (field) {
      field.disabled = disabled;
      field.value = node ? readProperty(node, field.getAttribute("data-prop")) : "";
    });
    els.rawXml.value = node ? prettyXml(new XMLSerializer().serializeToString(node)) : "";
    els.rawXml.disabled = disabled;
    els.applyRawXml.disabled = disabled;
    els.deleteNode.disabled = !node || node === ensureRootGroup();
  }

  function renderGridColumnEditor() {
    var node = selectedElement();
    var isGrid = node && localName(node) === "grid";
    els.gridColumnPanel.classList.toggle("is-visible", !!isGrid);
    if (!isGrid) {
      els.gridColumnEditor.innerHTML = "";
      return;
    }

    els.gridColumnEditor.innerHTML = gridColumnModels(node).map(function (column, index) {
      return [
        '<div class="grid-column-row">',
        '  <label><span>제목</span><input data-grid-index="' + index + '" data-grid-prop="label" value="' + escapeHtml(column.label) + '"></label>',
        '  <label><span>컬럼</span><input data-grid-index="' + index + '" data-grid-prop="field" value="' + escapeHtml(column.field) + '"></label>',
        '  <label><span>너비</span><input data-grid-index="' + index + '" data-grid-prop="width" value="' + escapeHtml(column.width) + '"></label>',
        '  <button type="button" data-grid-remove="' + index + '">×</button>',
        '</div>'
      ].join("");
    }).join("");
  }

  function renderSources() {
    if (document.activeElement !== els.clxSource) {
      els.clxSource.value = serializeClx();
    }
    if (document.activeElement !== els.jsSource) {
      els.jsSource.value = state.jsSource || "";
    }
  }

  function setView(viewName) {
    if (!state.advancedMode && viewName !== "design") viewName = "design";
    state.activeView = viewName;
    els.viewTabs.forEach(function (tab) {
      tab.classList.toggle("is-active", tab.getAttribute("data-view") === viewName);
    });
    els.viewPanes.forEach(function (pane) {
      pane.classList.toggle("is-active", pane.getAttribute("data-pane") === viewName);
    });
    renderSources();
  }

  function setAdvancedMode(enabled, silent) {
    state.advancedMode = !!enabled;
    document.body.classList.toggle("advanced-mode", state.advancedMode);
    els.toggleAdvanced.classList.toggle("is-active", state.advancedMode);
    els.toggleAdvanced.setAttribute("aria-pressed", state.advancedMode ? "true" : "false");
    els.toggleAdvanced.textContent = state.advancedMode ? "쉬운 보기" : "고급 보기";
    if (!state.advancedMode && state.activeView !== "design") {
      setView("design");
    }
    if (!silent) renderAll();
  }

  function selectNode(key) {
    state.selectedKey = key || "";
    renderAll();
  }

  function selectedElement() {
    return state.selectedKey ? state.nodeMap.get(state.selectedKey) || null : null;
  }

  function updateSelectedProperty(prop, value) {
    var node = selectedElement();
    if (!node) return;

    if (prop === "bindColumn") {
      setBoundColumn(node, value);
    } else if (prop === "row" || prop === "col" || prop === "rowspan" || prop === "colspan" || prop === "width" || prop === "height") {
      setFormDataAttr(node, prop, value);
    } else if (prop === "handler") {
      setClickHandler(node, value);
    } else if (prop === "value") {
      if (localName(node) === "button" || localName(node) === "output") node.setAttribute("value", value);
      else node.setAttribute("fieldLabel", value);
    } else if (prop === "fieldLabel") {
      node.setAttribute("fieldLabel", value);
    } else if (prop === "datasetid") {
      node.setAttribute("datasetid", value);
    } else if (prop === "id" || prop === "class") {
      if (value) node.setAttribute(prop, value);
      else node.removeAttribute(prop);
    }

    refreshPreviewAfterEdit();
    persist();
  }

  function refreshPreviewAfterEdit() {
    state.nodeMap = new Map();
    renderCanvas();
    renderTree();
    renderModelSummary();
    renderSources();
    renderHeader();
  }

  function readProperty(node, prop) {
    if (prop === "bindColumn") return boundColumn(node);
    if (prop === "handler") return clickHandler(node);
    if (prop === "row" || prop === "col" || prop === "rowspan" || prop === "colspan" || prop === "width" || prop === "height") {
      return formData(node).getAttribute(prop) || "";
    }
    if (prop === "value") return node.getAttribute("value") || node.getAttribute("fieldLabel") || "";
    if (prop === "fieldLabel") return node.getAttribute("fieldLabel") || "";
    return node.getAttribute(prop) || "";
  }

  function applyRawXml() {
    var node = selectedElement();
    if (!node) return;
    var replacement = parseFragment(els.rawXml.value);
    if (!replacement) {
      showToast("선택 XML을 읽지 못했습니다.");
      return;
    }
    node.parentNode.replaceChild(replacement, node);
    renderAll();
    persist();
    showToast("선택 XML을 적용했습니다.");
  }

  function addComponent(type) {
    var parent = selectedElement();
    if (!parent || localName(parent) !== "group") parent = nearestGroup(parent) || ensureRootGroup();

    var row = Math.max(0, componentChildren(parent).length);
    var fragment = componentTemplate(type, row);
    var node = parseFragment(fragment);
    if (!node) return;

    ensureGroupRows(parent, row + 1);
    var layout = directChild(parent, "formlayout");
    if (layout) parent.insertBefore(node, layout);
    else parent.appendChild(node);

    if (type === "button") addJsHandler(clickHandler(node));

    renderAll();
    var newKey = keyForElement(node);
    if (newKey) selectNode(newKey);
    persist();
    showToast(type + " 컴포넌트를 추가했습니다.");
  }

  function deleteSelectedNode() {
    var node = selectedElement();
    if (!node || node === ensureRootGroup()) return;
    var parent = node.parentNode;
    parent.removeChild(node);
    state.selectedKey = "";
    renderAll();
    persist();
    showToast("선택한 컴포넌트를 삭제했습니다.");
  }

  function clearDragClasses() {
    Array.prototype.slice.call(document.querySelectorAll(".is-dragging, .is-drop-target")).forEach(function (node) {
      node.classList.remove("is-dragging", "is-drop-target");
    });
    state.dragKey = "";
  }

  function moveByDrop(dragKey, targetKey) {
    if (!dragKey || !targetKey || dragKey === "0" || dragKey === targetKey) return;
    var dragged = state.nodeMap.get(dragKey);
    var target = state.nodeMap.get(targetKey);
    if (!dragged || !target || dragged === ensureRootGroup()) return;
    if (isAncestorOf(dragged, target)) return;

    if (localName(target) === "group") {
      moveNodeToGroup(dragged, target);
      finishMove(dragged, "선택한 항목을 영역 아래로 옮겼습니다.");
      return;
    }

    if (dragged.parentNode === target.parentNode) {
      swapFormData(dragged, target);
      finishMove(dragged, "두 항목의 위치를 바꿨습니다.");
      return;
    }

    var targetGroup = nearestGroup(target);
    if (!targetGroup) return;
    targetGroup.insertBefore(dragged, target);
    copyFormData(target, dragged);
    finishMove(dragged, "선택한 항목을 옮겼습니다.");
  }

  function moveSelected(direction) {
    var node = selectedElement();
    if (!node || node === ensureRootGroup()) return;
    var data = formData(node);
    var row = Number(data.getAttribute("row") || 0);
    var col = Number(data.getAttribute("col") || 0);

    if (direction === "up") row = Math.max(0, row - 1);
    if (direction === "down") row += 1;
    if (direction === "left") col = Math.max(0, col - 1);
    if (direction === "right") col += 1;

    data.setAttribute("row", row);
    data.setAttribute("col", col);
    ensureGroupRows(ownerGroup(node), row + 1);
    ensureGroupColumns(ownerGroup(node), col + 1);
    finishMove(node, "위치를 조정했습니다.");
  }

  function moveNodeToGroup(node, group) {
    if (!node || !group || node === group) return;
    var row = componentChildren(group).length;
    var layout = directChild(group, "formlayout");
    if (layout) group.insertBefore(node, layout);
    else group.appendChild(node);
    var data = formData(node);
    data.setAttribute("row", row);
    data.setAttribute("col", "0");
    ensureGroupRows(group, row + 1);
    ensureGroupColumns(group, 1);
  }

  function swapFormData(a, b) {
    var aData = formData(a);
    var bData = formData(b);
    ["row", "col", "rowspan", "colspan", "width", "height"].forEach(function (attr) {
      var aValue = aData.getAttribute(attr);
      var bValue = bData.getAttribute(attr);
      if (bValue == null) aData.removeAttribute(attr);
      else aData.setAttribute(attr, bValue);
      if (aValue == null) bData.removeAttribute(attr);
      else bData.setAttribute(attr, aValue);
    });
  }

  function copyFormData(source, target) {
    var sourceData = formData(source);
    var targetData = formData(target);
    ["row", "col", "rowspan", "colspan", "width", "height"].forEach(function (attr) {
      var value = sourceData.getAttribute(attr);
      if (value == null) targetData.removeAttribute(attr);
      else targetData.setAttribute(attr, value);
    });
  }

  function finishMove(node, message) {
    renderAll();
    state.selectedKey = keyForElement(node) || "";
    renderAll();
    persist();
    showToast(message);
  }

  function componentTemplate(type, row) {
    var id = uniqueId(type);
    var sid = nextSid("gen");
    var formData = '<cl:formdata std:sid="' + sid + '-fd" row="' + row + '" col="0"/>';
    if (type === "group") {
      return '<cl:group std:sid="' + sid + '" id="' + id + '" class="box">' +
        formData +
        '<cl:formlayout std:sid="' + sid + '-layout" scrollable="false" hspace="8px" vspace="8px">' +
        '<cl:rows length="40" unit="PIXEL"/><cl:columns length="1" unit="FRACTION"/>' +
        '</cl:formlayout></cl:group>';
    }
    if (type === "output") {
      return '<cl:output std:sid="' + sid + '" id="' + id + '" value="라벨">' + formData + '</cl:output>';
    }
    if (type === "inputbox") {
      return '<cl:inputbox std:sid="' + sid + '" id="' + id + '" fieldLabel="입력">' +
        '<cl:relativebind property="value" columnname="COLUMN1"/>' + formData + '</cl:inputbox>';
    }
    if (type === "combobox") {
      return '<cl:combobox std:sid="' + sid + '" id="' + id + '" fieldLabel="선택" preventinput="true">' +
        '<cl:relativebind property="value" columnname="COLUMN1"/>' + formData +
        '<cl:item std:sid="' + sid + '-item1" label="선택" value=""/><cl:item std:sid="' + sid + '-item2" label="Y" value="Y"/><cl:item std:sid="' + sid + '-item3" label="N" value="N"/>' +
        '</cl:combobox>';
    }
    if (type === "dateinput") {
      return '<cl:dateinput std:sid="' + sid + '" id="' + id + '" fieldLabel="날짜" mask="YYYY-MM-DD" format="YYYYMMDD">' +
        '<cl:relativebind property="value" columnname="DATE_COLUMN"/>' + formData + '</cl:dateinput>';
    }
    if (type === "textarea") {
      return '<cl:textarea std:sid="' + sid + '" id="' + id + '" fieldLabel="메모">' +
        '<cl:relativebind property="value" columnname="MEMO"/>' + formData.replace("/>", ' height="80"/>') + '</cl:textarea>';
    }
    if (type === "button") {
      var handler = "on" + toPascal(id) + "Click";
      return '<cl:button std:sid="' + sid + '" id="' + id + '" value="버튼">' +
        '<cl:listener std:sid="' + sid + '-listener" name="click" handler="' + handler + '"/>' +
        formData.replace("/>", ' width="90" height="30"/>') + '</cl:button>';
    }
    if (type === "grid") {
      return '<cl:grid std:sid="' + sid + '" id="' + id + '" fieldLabel="목록" datasetid="dsList">' +
        formData.replace("/>", ' height="180"/>') +
        '<cl:gridcolumn std:sid="' + sid + '-col1" width="120px"/><cl:gridcolumn std:sid="' + sid + '-col2" width="160px"/>' +
        '<cl:gridheader std:sid="' + sid + '-head"><cl:gridrow std:sid="' + sid + '-hrow" height="28px"/>' +
        '<cl:gridcell std:sid="' + sid + '-hcell1" rowindex="0" colindex="0" text="컬럼1" targetcolumnname="COLUMN1"/>' +
        '<cl:gridcell std:sid="' + sid + '-hcell2" rowindex="0" colindex="1" text="컬럼2" targetcolumnname="COLUMN2"/>' +
        '</cl:gridheader><cl:griddetail std:sid="' + sid + '-detail"><cl:gridrow std:sid="' + sid + '-drow" height="28px"/>' +
        '<cl:gridcell std:sid="' + sid + '-dcell1" rowindex="0" colindex="0" columnname="COLUMN1"/>' +
        '<cl:gridcell std:sid="' + sid + '-dcell2" rowindex="0" colindex="1" columnname="COLUMN2"/>' +
        '</cl:griddetail></cl:grid>';
    }
    return "";
  }

  function parseFragment(xml) {
    var wrapper = '<wrap xmlns:cl="' + CL_NS + '" xmlns:std="' + STD_NS + '">' + xml + '</wrap>';
    var doc = new DOMParser().parseFromString(wrapper, "application/xml");
    if (doc.getElementsByTagName("parsererror")[0]) return null;
    var first = doc.documentElement.firstElementChild;
    return first ? state.xmlDoc.importNode(first, true) : null;
  }

  function serializeClx(pretty) {
    var xml = new XMLSerializer().serializeToString(state.xmlDoc);
    return pretty === false ? xml : prettyXml(xml);
  }

  function prettyXml(xml) {
    var formatted = "";
    var pad = 0;
    xml = String(xml || "").replace(/>\s*</g, "><").replace(/></g, ">\n<");
    xml.split("\n").forEach(function (line) {
      if (/^<\/.+>/.test(line)) pad = Math.max(pad - 1, 0);
      formatted += repeat("  ", pad) + line + "\n";
      if (/^<[^!?/][^>]*[^/]?>$/.test(line) && !/^<[^>]+><\/[^>]+>$/.test(line)) pad += 1;
    });
    return formatted.trim();
  }

  function ensureRootGroup() {
    var root = getByLocalName("group").find(function (node) {
      return node.getAttribute("id") === "grpRoot";
    }) || getByLocalName("group")[0];
    if (root) return root;

    var body = getByLocalName("body")[0] || state.xmlDoc.documentElement;
    var group = parseFragment('<cl:group std:sid="' + nextSid("group") + '" id="grpRoot"><cl:formlayout std:sid="' + nextSid("layout") + '" scrollable="false"><cl:rows length="1" unit="FRACTION"/><cl:columns length="1" unit="FRACTION"/></cl:formlayout></cl:group>');
    body.appendChild(group);
    return group;
  }

  function getDefaultScreen() {
    return getByLocalName("screen").find(function (screen) {
      return screen.getAttribute("id") === "default";
    }) || getByLocalName("screen")[0] || null;
  }

  function componentChildren(parent) {
    return Array.prototype.slice.call(parent.children || []).filter(function (child) {
      return isVisualTag(localName(child));
    });
  }

  function collectVisualNodes() {
    var nodes = [];
    function visit(node) {
      if (!node || node.nodeType !== 1) return;
      if (isVisualTag(localName(node))) nodes.push(node);
      Array.prototype.slice.call(node.children || []).forEach(visit);
    }
    visit(ensureRootGroup());
    return nodes;
  }

  function isVisualTag(name) {
    return VISUAL_TAGS.indexOf(name) >= 0;
  }

  function applyGroupLayout(view, xmlNode) {
    var layout = directChild(xmlNode, "formlayout");
    var rows = layout ? directChildren(layout, "rows").map(layoutTrack) : [];
    var cols = layout ? directChildren(layout, "columns").map(layoutTrack) : [];
    view.style.display = "grid";
    view.style.gridTemplateRows = rows.length ? rows.join(" ") : "auto";
    view.style.gridTemplateColumns = cols.length ? cols.join(" ") : "1fr";
    view.style.gap = layout ? readGap(layout) : "8px";
  }

  function layoutTrack(node) {
    var length = node.getAttribute("length") || "1";
    var unit = (node.getAttribute("unit") || "FRACTION").toUpperCase();
    if (unit === "FRACTION") return Number(length) ? Number(length) + "fr" : "1fr";
    if (unit === "PIXEL") return readLength(length, 32) + "px";
    return length;
  }

  function readGap(layout) {
    var h = readLength(layout.getAttribute("hspace") || layout.getAttribute("hspacing"), 8);
    var v = readLength(layout.getAttribute("vspace") || layout.getAttribute("vspacing"), 8);
    return v + "px " + h + "px";
  }

  function applyFormData(view, xmlNode) {
    var data = formData(xmlNode);
    var row = Number(data.getAttribute("row") || 0) + 1;
    var col = Number(data.getAttribute("col") || 0) + 1;
    var rowspan = Number(data.getAttribute("rowspan") || 1);
    var colspan = Number(data.getAttribute("colspan") || 1);
    view.style.gridRow = row + " / span " + rowspan;
    view.style.gridColumn = col + " / span " + colspan;

    var width = data.getAttribute("width");
    var height = data.getAttribute("height");
    if (width) view.style.width = normalizeCssLength(width);
    if (height) view.style.minHeight = normalizeCssLength(height);
  }

  function formData(node) {
    var existing = directChild(node, "formdata");
    if (existing) return existing;
    var data = parseFragment('<cl:formdata std:sid="' + nextSid("fdata") + '" row="0" col="0"/>');
    node.insertBefore(data, node.firstChild);
    return data;
  }

  function setFormDataAttr(node, attr, value) {
    var data = formData(node);
    if (value === "") data.removeAttribute(attr);
    else data.setAttribute(attr, value);
  }

  function boundColumn(node) {
    var bind = directChild(node, "relativebind");
    return bind ? bind.getAttribute("columnname") || "" : "";
  }

  function setBoundColumn(node, value) {
    var bind = directChild(node, "relativebind");
    if (!value) {
      if (bind) node.removeChild(bind);
      return;
    }
    if (!bind) {
      bind = parseFragment('<cl:relativebind property="value" columnname=""/>');
      node.insertBefore(bind, node.firstChild);
    }
    bind.setAttribute("property", "value");
    bind.setAttribute("columnname", value);
  }

  function clickHandler(node) {
    var listener = directChildren(node, "listener").find(function (item) {
      return (item.getAttribute("name") || "").toLowerCase() === "click";
    });
    return listener ? listener.getAttribute("handler") || "" : "";
  }

  function setClickHandler(node, value) {
    var listener = directChildren(node, "listener").find(function (item) {
      return (item.getAttribute("name") || "").toLowerCase() === "click";
    });
    if (!value) {
      if (listener) node.removeChild(listener);
      return;
    }
    if (!listener) {
      listener = parseFragment('<cl:listener std:sid="' + nextSid("listener") + '" name="click" handler=""/>');
      node.insertBefore(listener, node.firstChild);
    }
    listener.setAttribute("name", "click");
    listener.setAttribute("handler", value);
  }

  function nearestGroup(node) {
    while (node && node.parentNode) {
      if (localName(node) === "group") return node;
      node = node.parentNode;
    }
    return null;
  }

  function ownerGroup(node) {
    node = node && node.parentNode;
    while (node && node.parentNode) {
      if (localName(node) === "group") return node;
      node = node.parentNode;
    }
    return null;
  }

  function isAncestorOf(parent, child) {
    var current = child;
    while (current) {
      if (current === parent) return true;
      current = current.parentNode;
    }
    return false;
  }

  function ensureGroupRows(group, count) {
    if (!group) return;
    var layout = directChild(group, "formlayout");
    if (!layout) {
      layout = parseFragment('<cl:formlayout std:sid="' + nextSid("layout") + '" scrollable="false" hspace="8px" vspace="8px"><cl:columns length="1" unit="FRACTION"/></cl:formlayout>');
      group.appendChild(layout);
    }
    while (directChildren(layout, "rows").length < count) {
      layout.insertBefore(parseFragment('<cl:rows length="40" unit="PIXEL"/>'), directChild(layout, "columns"));
    }
    if (!directChildren(layout, "columns").length) {
      layout.appendChild(parseFragment('<cl:columns length="1" unit="FRACTION"/>'));
    }
  }

  function ensureGroupColumns(group, count) {
    if (!group) return;
    var layout = directChild(group, "formlayout");
    if (!layout) {
      layout = parseFragment('<cl:formlayout std:sid="' + nextSid("layout") + '" scrollable="false" hspace="8px" vspace="8px"><cl:rows length="40" unit="PIXEL"/></cl:formlayout>');
      group.appendChild(layout);
    }
    while (directChildren(layout, "columns").length < count) {
      layout.appendChild(parseFragment('<cl:columns length="1" unit="FRACTION"/>'));
    }
    if (!directChildren(layout, "rows").length) {
      layout.insertBefore(parseFragment('<cl:rows length="40" unit="PIXEL"/>'), directChild(layout, "columns"));
    }
  }

  function addJsHandler(handler) {
    if (!handler || state.jsSource.indexOf("function " + handler) >= 0) return;
    state.jsSource += (state.jsSource.trim() ? "\n\n" : "") +
      "function " + handler + "(e) {\n" +
      "  // TODO: 버튼 동작을 구현합니다.\n" +
      "}\n";
  }

  function keyForElement(element) {
    var found = "";
    state.nodeMap.forEach(function (node, key) {
      if (node === element) found = key;
    });
    return found;
  }

  function gridHeaders(grid) {
    return getChildrenByLocalName(grid, "gridcell").filter(function (cell) {
      return cell.parentNode && localName(cell.parentNode) === "gridheader";
    }).map(function (cell) {
      return cell.getAttribute("text") || cell.getAttribute("targetcolumnname") || cell.getAttribute("columnname") || "";
    }).filter(Boolean);
  }

  function datasetColumns(datasetId) {
    var dataset = getByLocalName("dataset").find(function (node) {
      return node.getAttribute("id") === datasetId;
    });
    return dataset ? getChildrenByLocalName(dataset, "datacolumn").map(function (column) {
      return column.getAttribute("comment") || column.getAttribute("name") || "";
    }).filter(Boolean) : [];
  }

  function gridColumnModels(grid) {
    var columns = directChildren(grid, "gridcolumn");
    var headers = gridHeaderCells(grid);
    var details = gridDetailCells(grid);
    var datasetCols = datasetColumnNodes(grid.getAttribute("datasetid"));
    var count = Math.max(columns.length, headers.length, details.length, datasetCols.length, 1);
    var result = [];

    for (var index = 0; index < count; index++) {
      var field = (details[index] && details[index].getAttribute("columnname")) ||
        (headers[index] && headers[index].getAttribute("targetcolumnname")) ||
        (datasetCols[index] && datasetCols[index].getAttribute("name")) ||
        ("COLUMN" + (index + 1));
      var label = (headers[index] && headers[index].getAttribute("text")) ||
        (datasetCols[index] && datasetCols[index].getAttribute("comment")) ||
        field;
      var width = columns[index] && columns[index].getAttribute("width") || "120px";
      result.push({ field: field, label: label, width: width });
    }

    return result;
  }

  function updateGridColumn(index, prop, value) {
    var grid = selectedElement();
    if (!grid || localName(grid) !== "grid" || index < 0) return;
    ensureGridColumnNodes(grid, index + 1);

    var columns = directChildren(grid, "gridcolumn");
    var headers = gridHeaderCells(grid);
    var details = gridDetailCells(grid);
    var datasetCol = ensureDatasetColumn(grid, index);

    if (prop === "label") {
      headers[index].setAttribute("text", value || ("컬럼" + (index + 1)));
      datasetCol.setAttribute("comment", value || ("컬럼" + (index + 1)));
    }
    if (prop === "field") {
      var fieldName = sanitizeColumnName(value || ("COLUMN" + (index + 1)));
      headers[index].setAttribute("targetcolumnname", fieldName);
      details[index].setAttribute("columnname", fieldName);
      datasetCol.setAttribute("name", fieldName);
    }
    if (prop === "width") {
      columns[index].setAttribute("width", normalizeColumnWidth(value || "120"));
    }

    refreshPreviewAfterEdit();
    persist();
  }

  function addGridColumn() {
    var grid = selectedElement();
    if (!grid || localName(grid) !== "grid") return;
    var index = gridColumnModels(grid).length;
    ensureGridColumnNodes(grid, index + 1);
    updateGridColumn(index, "field", "COLUMN" + (index + 1));
    updateGridColumn(index, "label", "컬럼" + (index + 1));
    updateGridColumn(index, "width", "120");
    showToast("목록 컬럼을 추가했습니다.");
  }

  function removeGridColumn(index) {
    var grid = selectedElement();
    if (!grid || localName(grid) !== "grid") return;
    var models = gridColumnModels(grid);
    if (models.length <= 1) {
      showToast("목록에는 최소 1개 컬럼이 필요합니다.");
      return;
    }

    removeAt(directChildren(grid, "gridcolumn"), index);
    removeAt(gridHeaderCells(grid), index);
    removeAt(gridDetailCells(grid), index);
    removeAt(datasetColumnNodes(grid.getAttribute("datasetid")), index);
    reindexGridCells(grid);
    renderAll();
    persist();
    showToast("목록 컬럼을 삭제했습니다.");
  }

  function ensureGridColumnNodes(grid, count) {
    var header = ensureGridSection(grid, "gridheader");
    var detail = ensureGridSection(grid, "griddetail");
    var firstHeaderCell = gridHeaderCells(grid)[0] || null;
    var firstDetailCell = gridDetailCells(grid)[0] || null;

    while (directChildren(grid, "gridcolumn").length < count) {
      var column = parseFragment('<cl:gridcolumn std:sid="' + nextSid("gcol") + '" width="120px"/>');
      grid.insertBefore(column, header);
    }
    while (gridHeaderCells(grid).length < count) {
      header.appendChild(parseFragment('<cl:gridcell std:sid="' + nextSid("ghcell") + '" rowindex="0" colindex="0" text="컬럼" targetcolumnname="COLUMN"/>'));
    }
    while (gridDetailCells(grid).length < count) {
      detail.appendChild(parseFragment('<cl:gridcell std:sid="' + nextSid("gdcell") + '" rowindex="0" colindex="0" columnname="COLUMN"/>'));
    }
    for (var index = 0; index < count; index++) {
      ensureDatasetColumn(grid, index);
    }
    reindexGridCells(grid);

    if (firstHeaderCell || firstDetailCell) {
      return;
    }
  }

  function ensureGridSection(grid, tagName) {
    var section = directChild(grid, tagName);
    if (section) return section;
    section = parseFragment('<cl:' + tagName + ' std:sid="' + nextSid(tagName) + '"><cl:gridrow std:sid="' + nextSid("grow") + '" height="28px"/></cl:' + tagName + '>');
    grid.appendChild(section);
    return section;
  }

  function ensureDatasetColumn(grid, index) {
    var datasetId = grid.getAttribute("datasetid") || "dsList";
    grid.setAttribute("datasetid", datasetId);
    var dataset = ensureDataset(datasetId);
    var list = ensureDataColumnList(dataset);
    var columns = directChildren(list, "datacolumn");
    while (columns.length <= index) {
      var nextIndex = columns.length + 1;
      list.appendChild(parseFragment('<cl:datacolumn std:sid="' + nextSid("dcol") + '" name="COLUMN' + nextIndex + '" comment="컬럼' + nextIndex + '" datatype="string"/>'));
      columns = directChildren(list, "datacolumn");
    }
    return columns[index];
  }

  function ensureDataset(id) {
    var dataset = getByLocalName("dataset").find(function (node) {
      return node.getAttribute("id") === id;
    });
    if (dataset) return dataset;
    dataset = parseFragment('<cl:dataset std:sid="' + nextSid("dataset") + '" id="' + id + '"><cl:datacolumnlist/><cl:datarowlist/></cl:dataset>');
    ensureModel().appendChild(dataset);
    return dataset;
  }

  function ensureModel() {
    var model = getByLocalName("model")[0];
    if (model) return model;
    model = parseFragment('<cl:model std:sid="' + nextSid("model") + '"/>');
    var head = getByLocalName("head")[0] || state.xmlDoc.documentElement;
    var appspec = directChild(head, "appspec");
    if (appspec) head.insertBefore(model, appspec);
    else head.appendChild(model);
    return model;
  }

  function ensureDataColumnList(dataset) {
    var list = directChild(dataset, "datacolumnlist");
    if (list) return list;
    list = parseFragment('<cl:datacolumnlist/>');
    dataset.insertBefore(list, dataset.firstChild);
    return list;
  }

  function gridHeaderCells(grid) {
    var header = directChild(grid, "gridheader");
    return header ? getChildrenByLocalName(header, "gridcell").sort(byColIndex) : [];
  }

  function gridDetailCells(grid) {
    var detail = directChild(grid, "griddetail");
    return detail ? getChildrenByLocalName(detail, "gridcell").sort(byColIndex) : [];
  }

  function datasetColumnNodes(datasetId) {
    var dataset = getByLocalName("dataset").find(function (node) {
      return node.getAttribute("id") === datasetId;
    });
    if (!dataset) return [];
    var list = directChild(dataset, "datacolumnlist") || dataset;
    return directChildren(list, "datacolumn");
  }

  function reindexGridCells(grid) {
    gridHeaderCells(grid).forEach(function (cell, index) {
      cell.setAttribute("rowindex", "0");
      cell.setAttribute("colindex", String(index));
    });
    gridDetailCells(grid).forEach(function (cell, index) {
      cell.setAttribute("rowindex", "0");
      cell.setAttribute("colindex", String(index));
    });
  }

  function removeAt(list, index) {
    if (list[index] && list[index].parentNode) {
      list[index].parentNode.removeChild(list[index]);
    }
  }

  function byColIndex(a, b) {
    return Number(a.getAttribute("colindex") || 0) - Number(b.getAttribute("colindex") || 0);
  }

  function getByLocalName(name) {
    if (!state.xmlDoc) return [];
    return Array.prototype.slice.call(state.xmlDoc.getElementsByTagNameNS("*", name));
  }

  function getChildrenByLocalName(node, name) {
    var result = [];
    function visit(current) {
      Array.prototype.slice.call(current.children || []).forEach(function (child) {
        if (localName(child) === name) result.push(child);
        visit(child);
      });
    }
    visit(node);
    return result;
  }

  function directChild(node, name) {
    return directChildren(node, name)[0] || null;
  }

  function directChildren(node, name) {
    return Array.prototype.slice.call(node.children || []).filter(function (child) {
      return localName(child) === name;
    });
  }

  function localName(node) {
    return node && (node.localName || node.nodeName || "").replace(/^.*:/, "").toLowerCase();
  }

  function describeNode(node) {
    if (!node) return "";
    var tag = localName(node);
    return node.getAttribute("id") || node.getAttribute("value") || node.getAttribute("fieldLabel") || node.getAttribute("datasetid") || tag;
  }

  function uniqueId(type) {
    var prefix = {
      group: "grp",
      output: "opt",
      inputbox: "ipb",
      combobox: "cmb",
      dateinput: "dti",
      textarea: "txa",
      button: "btn",
      grid: "grd"
    }[type] || "ctl";
    var used = {};
    collectVisualNodes().forEach(function (node) {
      if (node.getAttribute("id")) used[node.getAttribute("id")] = true;
    });
    var index = 1;
    var id = prefix + index;
    while (used[id]) {
      index += 1;
      id = prefix + index;
    }
    return id;
  }

  function nextSid(prefix) {
    state.sidIndex += 1;
    return prefix + "-" + ("0000" + state.sidIndex).slice(-4);
  }

  function defaultClx() {
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:cl="' + CL_NS + '" xmlns:std="' + STD_NS + '" std:sid="html-0001" version="1.0.3309">',
      '  <head std:sid="head-0001">',
      '    <screen std:sid="screen-0001" id="default" name="default" minwidth="1280px" width="1280px" height="720px"/>',
      '    <screen std:sid="screen-0002" id="tablet" name="tablet" minwidth="700px" maxwidth="1279px" width="700px" height="667px"/>',
      '    <screen std:sid="screen-0003" id="mobile" name="mobile" maxwidth="699px" width="350px" height="525px"/>',
      '    <cl:model std:sid="model-0001">',
      '      <cl:datamap std:sid="dmap-0001" id="dmSearch">',
      '        <cl:datacolumnlist><cl:datacolumn std:sid="dcol-0001" name="KEYWORD" comment="검색어" datatype="string"/></cl:datacolumnlist>',
      '      </cl:datamap>',
      '      <cl:dataset std:sid="dataset-0001" id="dsList">',
      '        <cl:datacolumnlist>',
      '          <cl:datacolumn std:sid="dcol-0002" name="COLUMN1" comment="컬럼1" datatype="string"/>',
      '          <cl:datacolumn std:sid="dcol-0003" name="COLUMN2" comment="컬럼2" datatype="string"/>',
      '        </cl:datacolumnlist>',
      '        <cl:datarowlist/>',
      '      </cl:dataset>',
      '      <cl:submission std:sid="sub-0001" id="subList" action="/sample/selectList.do"><cl:requestdata dataid="dmSearch"/><cl:responsedata dataid="dsList"/></cl:submission>',
      '    </cl:model>',
      '    <cl:appspec title="새 화면" dev-comment="Generated by eXBuilder6 Web IDE"/>',
      '  </head>',
      '  <body std:sid="body-0001">',
      '    <cl:listener std:sid="listener-0001" name="load" handler="onBodyLoad"/>',
      '    <cl:group std:sid="group-0001" id="grpRoot" style="padding:10px;">',
      '      <cl:group std:sid="group-0002" id="grpSearch" class="search-box">',
      '        <cl:formdata std:sid="fdata-0001" row="0" col="0"/>',
      '        <cl:output std:sid="output-0001" id="optKeyword" value="검색어"><cl:formdata std:sid="fdata-0002" row="0" col="0"/></cl:output>',
      '        <cl:inputbox std:sid="input-0001" id="ipbKeyword" fieldLabel="검색어"><cl:relativebind property="value" columnname="KEYWORD"/><cl:formdata std:sid="fdata-0003" row="0" col="1"/></cl:inputbox>',
      '        <cl:button std:sid="button-0001" id="btnSearch" value="조회"><cl:listener std:sid="listener-0002" name="click" handler="onBtnSearchClick"/><cl:formdata std:sid="fdata-0004" row="0" col="2" width="80" height="30"/></cl:button>',
      '        <cl:formlayout std:sid="layout-0001" scrollable="false" hspace="8px" vspace="8px"><cl:rows length="32" unit="PIXEL"/><cl:columns length="80" unit="PIXEL"/><cl:columns length="1" unit="FRACTION"/><cl:columns length="90" unit="PIXEL"/></cl:formlayout>',
      '      </cl:group>',
      '      <cl:grid std:sid="grid-0001" id="grdList" fieldLabel="목록" datasetid="dsList">',
      '        <cl:formdata std:sid="fdata-0005" row="1" col="0" height="420"/>',
      '        <cl:gridcolumn std:sid="gcol-0001" width="120px"/><cl:gridcolumn std:sid="gcol-0002" width="180px"/>',
      '        <cl:gridheader std:sid="ghead-0001"><cl:gridrow std:sid="grow-0001" height="28px"/><cl:gridcell std:sid="gcell-0001" rowindex="0" colindex="0" targetcolumnname="COLUMN1" text="컬럼1"/><cl:gridcell std:sid="gcell-0002" rowindex="0" colindex="1" targetcolumnname="COLUMN2" text="컬럼2"/></cl:gridheader>',
      '        <cl:griddetail std:sid="gdetail-0001"><cl:gridrow std:sid="grow-0002" height="28px"/><cl:gridcell std:sid="gcell-0003" rowindex="0" colindex="0" columnname="COLUMN1"/><cl:gridcell std:sid="gcell-0004" rowindex="0" colindex="1" columnname="COLUMN2"/></cl:griddetail>',
      '      </cl:grid>',
      '      <cl:formlayout std:sid="layout-0002" scrollable="false" hspace="0px" vspace="10px"><cl:rows length="52" unit="PIXEL"/><cl:rows length="1" unit="FRACTION"/><cl:columns length="1" unit="FRACTION"/></cl:formlayout>',
      '    </cl:group>',
      '    <cl:formlayout std:sid="layout-0003" scrollable="false" hspace="0px" vspace="0px"><cl:rows length="1" unit="FRACTION"/><cl:columns length="1" unit="FRACTION"/></cl:formlayout>',
      '  </body>',
      '</html>'
    ].join("\n");
  }

  function defaultJs() {
    return [
      "function onBodyLoad(e) {",
      "  // 화면 초기화 코드를 작성합니다.",
      "}",
      "",
      "function onBtnSearchClick(e) {",
      "  var submission = app.lookup(\"subList\");",
      "  if (submission && submission.send) submission.send();",
      "}"
    ].join("\n");
  }

  function downloadFile(fileName, content, type) {
    var blob = new Blob([content], { type: type });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(fileName + " 파일을 내보냈습니다.");
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () {
      els.toast.classList.remove("is-visible");
    }, 1800);
  }

  function readLength(value, fallback) {
    var parsed = parseInt(String(value || "").replace(/[^\d.-]/g, ""), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function normalizeCssLength(value) {
    var text = String(value || "").trim();
    if (!text) return "";
    return /[a-z%]+$/i.test(text) ? text : text + "px";
  }

  function normalizeColumnWidth(value) {
    var text = String(value || "").trim();
    if (!text) return "120px";
    return /[a-z%]+$/i.test(text) ? text : text + "px";
  }

  function repeat(value, count) {
    return new Array(count + 1).join(value);
  }

  function baseName(fileName) {
    return String(fileName || "screen").replace(/\.[^.]+$/, "") || "screen";
  }

  function sanitizeFileName(fileName, fallback) {
    var name = String(fileName || "").replace(/[\\/:*?"<>|]/g, "").trim();
    return name || fallback || "screen.clx";
  }

  function sanitizeColumnName(value) {
    var name = String(value || "").trim().replace(/\s+/g, "_").replace(/[^\w]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
    if (!name) name = "COLUMN";
    if (/^\d/.test(name)) name = "C_" + name;
    return name.toUpperCase();
  }

  function toPascal(value) {
    return String(value || "").split(/[_\s-]+/).filter(Boolean).map(function (part) {
      var lower = part.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }).join("");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char];
    });
  }
})();
