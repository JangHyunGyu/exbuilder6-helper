(function () {
  "use strict";

  var STORAGE_KEY = "exbuilder6-screen-wizard:v1";

  var DEFAULTS = {
    templateType: "list",
    screenTitle: "사용자 목록",
    screenId: "userList",
    fileBaseName: "userList",
    appPath: "app/sample/userList",
    author: "",
    screenWidth: "1280",
    screenHeight: "620",
    searchFields: [
      "KEYWORD | 검색어 | string | N | inputbox",
      "USE_YN | 사용여부 | string | N | combobox"
    ].join("\n"),
    dataFields: [
      "USER_ID | 사용자 ID | string | Y | inputbox | 140",
      "USER_NM | 사용자명 | string | Y | inputbox | 160",
      "DEPT_NM | 부서 | string | N | inputbox | 180",
      "USE_YN | 사용 | string | N | combobox | 80",
      "REG_DT | 등록일 | string | N | dateinput | 110"
    ].join("\n"),
    endpointSearch: "/sample/selectUserList.do",
    endpointSave: "/sample/saveUserList.do",
    endpointDelete: "/sample/deleteUserList.do",
    includeSearch: true,
    includeReset: true,
    includeAdd: true,
    includeSave: true,
    includeDelete: true,
    includeCommonUtil: true,
    controlsPerRow: "2",
    labelWidth: "90",
    gridHeight: "360"
  };

  var PRESETS = {
    list: {
      templateType: "list",
      screenTitle: "사용자 목록",
      screenId: "userList",
      fileBaseName: "userList",
      appPath: "app/sample/userList",
      screenWidth: "1280",
      screenHeight: "620",
      searchFields: [
        "KEYWORD | 검색어 | string | N | inputbox",
        "USE_YN | 사용여부 | string | N | combobox"
      ].join("\n"),
      dataFields: [
        "USER_ID | 사용자 ID | string | Y | inputbox | 140",
        "USER_NM | 사용자명 | string | Y | inputbox | 160",
        "DEPT_NM | 부서 | string | N | inputbox | 180",
        "USE_YN | 사용 | string | N | combobox | 80",
        "REG_DT | 등록일 | string | N | dateinput | 110"
      ].join("\n"),
      endpointSearch: "/sample/selectUserList.do",
      endpointSave: "/sample/saveUserList.do",
      endpointDelete: "/sample/deleteUserList.do",
      includeSearch: true,
      includeReset: true,
      includeAdd: true,
      includeSave: true,
      includeDelete: true,
      controlsPerRow: "2",
      labelWidth: "90",
      gridHeight: "360"
    },
    form: {
      templateType: "form",
      screenTitle: "사용자 등록",
      screenId: "userForm",
      fileBaseName: "userForm",
      appPath: "app/sample/userForm",
      screenWidth: "760",
      screenHeight: "520",
      searchFields: "USER_ID | 사용자 ID | string | N | inputbox",
      dataFields: [
        "USER_ID | 사용자 ID | string | Y | inputbox | 140",
        "USER_NM | 사용자명 | string | Y | inputbox | 180",
        "DEPT_CD | 부서코드 | string | N | inputbox | 120",
        "DEPT_NM | 부서명 | string | N | inputbox | 180",
        "USE_YN | 사용여부 | string | N | combobox | 80",
        "MEMO | 메모 | string | N | textarea | 260"
      ].join("\n"),
      endpointSearch: "/sample/selectUser.do",
      endpointSave: "/sample/saveUser.do",
      endpointDelete: "",
      includeSearch: false,
      includeReset: true,
      includeAdd: false,
      includeSave: true,
      includeDelete: false,
      controlsPerRow: "2",
      labelWidth: "92",
      gridHeight: "260"
    },
    popup: {
      templateType: "popup",
      screenTitle: "사용자 선택",
      screenId: "userSelectPop",
      fileBaseName: "userSelectPop",
      appPath: "app/sample/userSelectPop",
      screenWidth: "640",
      screenHeight: "430",
      searchFields: "KEYWORD | 검색어 | string | N | inputbox",
      dataFields: [
        "USER_ID | 사용자 ID | string | Y | inputbox | 120",
        "USER_NM | 사용자명 | string | Y | inputbox | 160",
        "DEPT_NM | 부서 | string | N | inputbox | 180"
      ].join("\n"),
      endpointSearch: "/sample/selectUserList.do",
      endpointSave: "",
      endpointDelete: "",
      includeSearch: true,
      includeReset: true,
      includeAdd: false,
      includeSave: false,
      includeDelete: false,
      controlsPerRow: "1",
      labelWidth: "90",
      gridHeight: "250"
    }
  };

  var state = {};
  var generated = { clx: "", js: "" };
  var els = {};

  document.addEventListener("DOMContentLoaded", function () {
    bindElements();
    state = readSavedState();
    applyStateToForm();
    bindEvents();
    readInitialHash();
    render();
  });

  function bindElements() {
    els.form = document.getElementById("wizardForm");
    els.fields = Array.prototype.slice.call(document.querySelectorAll("[data-field]"));
    els.stepTabs = Array.prototype.slice.call(document.querySelectorAll(".step-tab"));
    els.sections = Array.prototype.slice.call(document.querySelectorAll("[data-section]"));
    els.previewTabs = Array.prototype.slice.call(document.querySelectorAll(".preview-tab"));
    els.previewPanes = Array.prototype.slice.call(document.querySelectorAll("[data-preview-pane]"));
    els.clxOutput = document.getElementById("clxOutput");
    els.jsOutput = document.getElementById("jsOutput");
    els.screenMock = document.getElementById("screenMock");
    els.fileSummary = document.getElementById("fileSummary");
    els.clxName = document.getElementById("clxName");
    els.jsName = document.getElementById("jsName");
    els.dataSummary = document.getElementById("dataSummary");
    els.logicSummary = document.getElementById("logicSummary");
    els.outputSummary = document.getElementById("outputSummary");
    els.generatedAt = document.getElementById("generatedAt");
    els.validationList = document.getElementById("validationList");
    els.toast = document.getElementById("toast");
    els.applyPreset = document.getElementById("applyPreset");
    els.resetAll = document.getElementById("resetAll");
    els.copyClx = document.getElementById("copyClx");
    els.copyJs = document.getElementById("copyJs");
    els.downloadClx = document.getElementById("downloadClx");
    els.downloadJs = document.getElementById("downloadJs");
    els.downloadAll = document.getElementById("downloadAll");
  }

  function bindEvents() {
    els.fields.forEach(function (field) {
      var eventName = field.type === "checkbox" || field.tagName === "SELECT" ? "change" : "input";
      field.addEventListener(eventName, function () {
        state = readFormState();
        persistState();
        render();
      });
    });

    els.stepTabs.forEach(function (button) {
      button.addEventListener("click", function () {
        setStep(button.getAttribute("data-step"), true);
      });
    });

    els.previewTabs.forEach(function (button) {
      button.addEventListener("click", function () {
        setPreviewPane(button.getAttribute("data-pane"));
      });
    });

    els.applyPreset.addEventListener("click", function () {
      var type = document.getElementById("templateType").value || "list";
      state = merge({}, DEFAULTS, PRESETS[type] || PRESETS.list, {
        author: state.author || ""
      });
      applyStateToForm();
      persistState();
      render();
      showToast("프리셋을 적용했습니다.");
    });

    els.resetAll.addEventListener("click", function () {
      state = merge({}, DEFAULTS);
      applyStateToForm();
      persistState();
      render();
      showToast("초기값으로 돌렸습니다.");
    });

    els.copyClx.addEventListener("click", function () {
      copyText(generated.clx, "CLX를 복사했습니다.");
    });

    els.copyJs.addEventListener("click", function () {
      copyText(generated.js, "JS를 복사했습니다.");
    });

    els.downloadClx.addEventListener("click", function () {
      downloadFile(getFileBaseName() + ".clx", generated.clx, "text/xml;charset=utf-8");
    });

    els.downloadJs.addEventListener("click", function () {
      downloadFile(getFileBaseName() + ".js", generated.js, "text/javascript;charset=utf-8");
    });

    els.downloadAll.addEventListener("click", function () {
      downloadFile(getFileBaseName() + ".clx", generated.clx, "text/xml;charset=utf-8");
      window.setTimeout(function () {
        downloadFile(getFileBaseName() + ".js", generated.js, "text/javascript;charset=utf-8");
      }, 120);
    });

    window.addEventListener("hashchange", readInitialHash);
  }

  function readSavedState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return merge({}, DEFAULTS, JSON.parse(raw));
    } catch (error) {}
    return merge({}, DEFAULTS);
  }

  function persistState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {}
  }

  function applyStateToForm() {
    els.fields.forEach(function (field) {
      var name = field.getAttribute("data-field");
      if (!(name in state)) return;
      if (field.type === "checkbox") {
        field.checked = !!state[name];
      } else {
        field.value = state[name] == null ? "" : state[name];
      }
    });
  }

  function readFormState() {
    var next = merge({}, state);
    els.fields.forEach(function (field) {
      var name = field.getAttribute("data-field");
      next[name] = field.type === "checkbox" ? field.checked : field.value;
    });
    return next;
  }

  function readInitialHash() {
    var step = String(window.location.hash || "").replace("#", "");
    if (["screen", "data", "logic", "output"].indexOf(step) >= 0) {
      setStep(step, false);
    }
  }

  function setStep(step, pushHash) {
    els.stepTabs.forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-step") === step);
    });
    els.sections.forEach(function (section) {
      section.classList.toggle("is-active", section.getAttribute("data-section") === step);
    });
    if (pushHash) {
      history.replaceState(null, "", "#" + step);
    }
  }

  function setPreviewPane(name) {
    els.previewTabs.forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-pane") === name);
    });
    els.previewPanes.forEach(function (pane) {
      pane.classList.toggle("is-active", pane.getAttribute("data-preview-pane") === name);
    });
  }

  function render() {
    var normalized = normalizeState(state);
    var parsed = {
      searchFields: parseFields(normalized.searchFields),
      dataFields: parseFields(normalized.dataFields)
    };
    var warnings = validateState(normalized, parsed);

    generated.clx = generateClx(normalized, parsed);
    generated.js = generateJs(normalized, parsed);

    var baseName = getFileBaseName(normalized);
    els.clxOutput.textContent = generated.clx;
    els.jsOutput.textContent = generated.js;
    els.clxName.textContent = baseName + ".clx";
    els.jsName.textContent = baseName + ".js";
    els.fileSummary.textContent = baseName + ".clx / " + baseName + ".js";
    els.dataSummary.textContent = parsed.searchFields.length + " 조건 / " + parsed.dataFields.length + " 컬럼";
    els.logicSummary.textContent = summarizeLogic(normalized);
    els.outputSummary.textContent = warnings.some(function (item) { return item.type === "error"; }) ? "확인 필요" : "준비됨";
    els.generatedAt.textContent = formatTime(new Date());
    renderValidation(warnings);
    renderMock(normalized, parsed);
  }

  function normalizeState(input) {
    var next = merge({}, DEFAULTS, input || {});
    next.templateType = PRESETS[next.templateType] ? next.templateType : "list";
    next.screenTitle = cleanText(next.screenTitle) || "새 화면";
    next.screenId = sanitizeIdentifier(next.screenId || toCamel(next.screenTitle) || "sampleScreen", "sampleScreen");
    next.fileBaseName = sanitizeFileName(next.fileBaseName || next.screenId || "sampleScreen");
    next.appPath = cleanText(next.appPath) || "app/sample/" + next.screenId;
    next.screenWidth = String(clampInt(next.screenWidth, 320, 3000, 1280));
    next.screenHeight = String(clampInt(next.screenHeight, 240, 2200, 620));
    next.controlsPerRow = String(clampInt(next.controlsPerRow, 1, 4, 2));
    next.labelWidth = String(clampInt(next.labelWidth, 50, 180, 90));
    next.gridHeight = String(clampInt(next.gridHeight, 120, 1200, 360));
    return next;
  }

  function validateState(model, parsed) {
    var items = [];
    if (!parsed.dataFields.length) {
      items.push({ type: "error", text: "목록/입력 컬럼이 필요합니다." });
    }
    if (model.includeSearch && !cleanText(model.endpointSearch) && model.templateType !== "form") {
      items.push({ type: "warn", text: "조회 URL이 비어 있습니다." });
    }
    if (model.includeSave && !cleanText(model.endpointSave)) {
      items.push({ type: "warn", text: "저장 URL이 비어 있습니다." });
    }
    if (model.includeDelete && !cleanText(model.endpointDelete)) {
      items.push({ type: "warn", text: "삭제 URL이 비어 있습니다." });
    }
    if (!items.length) {
      items.push({ type: "ok", text: "생성 준비가 끝났습니다." });
    }
    return items;
  }

  function renderValidation(items) {
    els.validationList.innerHTML = items.map(function (item) {
      return '<div class="validation-item ' + escapeAttr(item.type) + '">' + escapeHtml(item.text) + "</div>";
    }).join("");
  }

  function renderMock(model, parsed) {
    var dataFields = parsed.dataFields.slice(0, 6);
    var searchFields = parsed.searchFields.slice(0, 6);
    var typeLabel = { list: "조회 목록", form: "입력 저장", popup: "팝업 선택" }[model.templateType] || "화면";
    var body = [];

    body.push('<div class="mock-window">');
    body.push('<div class="mock-titlebar"><strong>' + escapeHtml(model.screenTitle) + '</strong><span class="mock-badge">' + escapeHtml(typeLabel) + '</span></div>');
    body.push('<div class="mock-body">');

    if (model.templateType !== "form" && model.includeSearch) {
      body.push('<div class="mock-search">');
      searchFields.forEach(function (field) {
        body.push('<div class="mock-field"><span>' + escapeHtml(field.label) + '</span><div class="mock-input"></div></div>');
      });
      if (!searchFields.length) {
        body.push('<div class="mock-field"><span>검색어</span><div class="mock-input"></div></div>');
      }
      body.push('</div>');
    }

    if (model.templateType === "form") {
      body.push('<div class="mock-form">');
      dataFields.forEach(function (field) {
        body.push('<div class="mock-field"><span>' + escapeHtml(field.label) + '</span><div class="mock-input"></div></div>');
      });
      body.push('</div>');
    } else {
      body.push('<div class="mock-grid"><div class="mock-grid-head">');
      dataFields.forEach(function (field) {
        body.push('<span>' + escapeHtml(field.label) + '</span>');
      });
      body.push('</div>');
      for (var row = 0; row < 5; row++) {
        body.push('<div class="mock-grid-row">');
        dataFields.forEach(function () {
          body.push('<span></span>');
        });
        body.push('</div>');
      }
      body.push('</div>');
    }

    body.push('<div class="mock-buttons">');
    if (model.includeReset) body.push('<span class="mock-button secondary">초기화</span>');
    if (model.includeSearch && model.templateType !== "form") body.push('<span class="mock-button">조회</span>');
    if (model.templateType === "popup") {
      body.push('<span class="mock-button">선택</span>');
      body.push('<span class="mock-button secondary">닫기</span>');
    } else {
      if (model.includeAdd) body.push('<span class="mock-button secondary">추가</span>');
      if (model.includeDelete) body.push('<span class="mock-button secondary">삭제</span>');
      if (model.includeSave) body.push('<span class="mock-button">저장</span>');
    }
    body.push('</div></div></div>');
    els.screenMock.innerHTML = body.join("");
  }

  function parseFields(value) {
    return String(value || "").split(/\r?\n/).map(function (line, index) {
      return parseFieldLine(line, index);
    }).filter(Boolean);
  }

  function parseFieldLine(line, index) {
    var cleaned = String(line || "").replace(/\s+#.*$/, "").trim();
    if (!cleaned) return null;
    var parts = cleaned.indexOf("|") >= 0 ? cleaned.split("|") : cleaned.split(",");
    var rawName = cleanText(parts[0]);
    var name = sanitizeColumnName(rawName || "COLUMN_" + (index + 1));
    var label = cleanText(parts[1]) || humanizeColumn(name);
    var type = normalizeDataType(parts[2]);
    var required = /^(y|yes|required|필수|true|1)$/i.test(cleanText(parts[3]));
    var control = normalizeControl(parts[4], type, name);
    var width = cleanText(parts[5]) || defaultColumnWidth(type, control);

    return {
      name: name,
      label: label,
      type: type,
      required: required,
      control: control,
      width: width
    };
  }

  function generateClx(model, parsed) {
    var sid = new SidFactory();
    var isList = model.templateType === "list";
    var isForm = model.templateType === "form";
    var isPopup = model.templateType === "popup";
    var mapId = isForm || isPopup ? "dmForm" : "dmSearch";
    var dataId = isForm || isPopup ? "dmForm" : "dsList";
    var rows = [];
    var children = [];

    if (isList) {
      if (model.includeSearch) {
        children.push(generateSearchGroup(model, parsed.searchFields, sid, 0, "dmSearch"));
        rows.push({ length: searchGroupHeight(model, parsed.searchFields), unit: "PIXEL" });
      }
      children.push(generateGrid(model, parsed.dataFields, sid, rows.length));
      rows.push({ length: "1", unit: "FRACTION" });
      children.push(generateFooterButtons(model, sid, rows.length));
      rows.push({ length: "42", unit: "PIXEL" });
    } else if (isForm) {
      children.push(generateFormGroup(model, parsed.dataFields, sid, 0, mapId));
      rows.push({ length: "1", unit: "FRACTION" });
      children.push(generateFooterButtons(model, sid, 1));
      rows.push({ length: "42", unit: "PIXEL" });
    } else {
      if (model.includeSearch) {
        children.push(generateSearchGroup(model, parsed.searchFields, sid, 0, "dmForm"));
        rows.push({ length: searchGroupHeight(model, parsed.searchFields), unit: "PIXEL" });
      }
      children.push(generateGrid(model, parsed.dataFields, sid, rows.length));
      rows.push({ length: "1", unit: "FRACTION" });
      children.push(generatePopupButtons(model, sid, rows.length));
      rows.push({ length: "42", unit: "PIXEL" });
    }

    var modelXml = [];
    modelXml.push(generateDataMap(mapId, isForm || isPopup ? mergeFields(parsed.searchFields, parsed.dataFields) : parsed.searchFields, sid));
    if (isList || isPopup) {
      modelXml.push(generateDataset("dsList", parsed.dataFields, sid));
    }
    if (model.includeSearch && cleanText(model.endpointSearch)) {
      modelXml.push(generateSubmission("subList", model.endpointSearch, [mapId], isForm ? [mapId] : ["dsList"], sid));
    }
    if (model.includeSave && cleanText(model.endpointSave)) {
      modelXml.push(generateSubmission("subSave", model.endpointSave, [dataId], [dataId], sid));
    }
    if (model.includeDelete && cleanText(model.endpointDelete)) {
      modelXml.push(generateSubmission("subDelete", model.endpointDelete, [dataId], [], sid));
    }

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:cl="http://tomatosystem.co.kr/cleopatra" xmlns:std="http://tomatosystem.co.kr/cleopatra/studio" std:sid="' + sid.next("html") + '" version="1.0.3309">',
      '  <head std:sid="' + sid.next("head") + '">',
      '    <screen std:sid="' + sid.next("screen") + '" id="default" name="default" minwidth="' + xmlAttr(model.screenWidth) + 'px" width="' + xmlAttr(model.screenWidth) + 'px" height="' + xmlAttr(model.screenHeight) + 'px"/>',
      '    <screen std:sid="' + sid.next("screen") + '" id="tablet" name="tablet" minwidth="700px" maxwidth="' + xmlAttr(String(Number(model.screenWidth) - 1)) + 'px" width="700px" height="667px"/>',
      '    <screen std:sid="' + sid.next("screen") + '" id="mobile" name="mobile" maxwidth="699px" width="350px" height="525px"/>',
      '    <cl:model std:sid="' + sid.next("model") + '">',
      modelXml.join("\n"),
      '    </cl:model>',
      '    <cl:appspec title="' + xmlAttr(model.screenTitle) + '" dev-comment="Generated by eXBuilder6 화면 마법사"/>',
      '  </head>',
      '  <body std:sid="' + sid.next("body") + '">',
      '    <cl:listener std:sid="' + sid.next("listener") + '" name="load" handler="onBodyLoad"/>',
      '    <cl:group std:sid="' + sid.next("group") + '" id="grpRoot" style="padding:10px;">',
      children.join("\n"),
      generateRootLayout(rows, sid),
      '    </cl:group>',
      '    <cl:formlayout std:sid="' + sid.next("f-layout") + '" scrollable="false" hspace="0px" vspace="0px" top-margin="0px" right-margin="0px" bottom-margin="0px" left-margin="0px">',
      '      <cl:rows length="1" unit="FRACTION"/>',
      '      <cl:columns length="1" unit="FRACTION"/>',
      '    </cl:formlayout>',
      '  </body>',
      '  <std:studiosetting>',
      '    <std:hruler/>',
      '    <std:vruler/>',
      '  </std:studiosetting>',
      '</html>'
    ].join("\n");
  }

  function generateDataMap(id, fields, sid) {
    return [
      '      <cl:datamap std:sid="' + sid.next("d-map") + '" id="' + xmlAttr(id) + '">',
      '        <cl:datacolumnlist>',
      fields.map(function (field) { return generateDataColumn(field, sid, 10); }).join("\n"),
      '        </cl:datacolumnlist>',
      '      </cl:datamap>'
    ].join("\n");
  }

  function generateDataset(id, fields, sid) {
    return [
      '      <cl:dataset std:sid="' + sid.next("d-set") + '" id="' + xmlAttr(id) + '">',
      '        <cl:datacolumnlist>',
      fields.map(function (field) { return generateDataColumn(field, sid, 10); }).join("\n"),
      '        </cl:datacolumnlist>',
      '        <cl:datarowlist/>',
      '      </cl:dataset>'
    ].join("\n");
  }

  function generateDataColumn(field, sid, indent) {
    var space = repeat(" ", indent);
    var attrs = [
      'comment="' + xmlAttr(field.label) + '"',
      'std:sid="' + sid.next("d-column") + '"',
      'name="' + xmlAttr(field.name) + '"'
    ];
    if (field.type) attrs.push('datatype="' + xmlAttr(field.type) + '"');
    return space + "<cl:datacolumn " + attrs.join(" ") + "/>";
  }

  function generateSubmission(id, action, requestIds, responseIds, sid) {
    var lines = [];
    lines.push('      <cl:submission std:sid="' + sid.next("submission") + '" id="' + xmlAttr(id) + '" action="' + xmlAttr(action) + '">');
    requestIds.forEach(function (item) {
      lines.push('        <cl:requestdata dataid="' + xmlAttr(item) + '"/>');
    });
    responseIds.forEach(function (item) {
      lines.push('        <cl:responsedata dataid="' + xmlAttr(item) + '"/>');
    });
    lines.push("      </cl:submission>");
    return lines.join("\n");
  }

  function generateSearchGroup(model, fields, sid, rowIndex, dataMapId) {
    var perRow = clampInt(model.controlsPerRow, 1, 4, 2);
    var rowCount = Math.max(1, Math.ceil(Math.max(fields.length, 1) / perRow));
    var labelWidth = clampInt(model.labelWidth, 50, 180, 90);
    var lines = [];
    lines.push('      <cl:group std:sid="' + sid.next("group") + '" id="grpSearch" class="search-box">');
    lines.push('        <cl:datamapcontext datacontrolid="' + xmlAttr(dataMapId || "dmSearch") + '"/>');
    lines.push('        <cl:formdata std:sid="' + sid.next("f-data") + '" row="' + rowIndex + '" col="0"/>');
    fields.forEach(function (field, index) {
      var row = Math.floor(index / perRow);
      var col = (index % perRow) * 2;
      lines.push(generateLabeledControl(field, sid, row, col, "search"));
    });
    lines.push('        <cl:group std:sid="' + sid.next("group") + '" id="grpSearchButtons">');
    lines.push('          <cl:formdata std:sid="' + sid.next("f-data") + '" row="0" col="' + (perRow * 2) + '" rowspan="' + rowCount + '" colspan="1"/>');
    if (model.includeReset) {
      lines.push(generateButton("btnReset", "초기화", "onBtnResetClick", sid, "          ", "80px"));
    }
    if (model.includeSearch) {
      lines.push(generateButton("btnSearch", "조회", "onBtnSearchClick", sid, "          ", "80px"));
    }
    lines.push('          <cl:flowlayout std:sid="' + sid.next("f-layout") + '" scrollable="false" hspacing="8" vspacing="0" halign="right" valign="middle"/>');
    lines.push("        </cl:group>");
    lines.push(generateFormLayout(rowCount, perRow, labelWidth, true, sid, "        "));
    lines.push("      </cl:group>");
    return lines.join("\n");
  }

  function generateFormGroup(model, fields, sid, rowIndex, dataMapId) {
    var perRow = clampInt(model.controlsPerRow, 1, 4, 2);
    var rowCount = Math.max(1, Math.ceil(Math.max(fields.length, 1) / perRow));
    var labelWidth = clampInt(model.labelWidth, 50, 180, 90);
    var lines = [];
    lines.push('      <cl:group std:sid="' + sid.next("group") + '" id="grpForm" class="form-box">');
    lines.push('        <cl:datamapcontext datacontrolid="' + xmlAttr(dataMapId) + '"/>');
    lines.push('        <cl:formdata std:sid="' + sid.next("f-data") + '" row="' + rowIndex + '" col="0"/>');
    fields.forEach(function (field, index) {
      var row = Math.floor(index / perRow);
      var col = (index % perRow) * 2;
      lines.push(generateLabeledControl(field, sid, row, col, "form"));
    });
    lines.push(generateFormLayout(rowCount, perRow, labelWidth, false, sid, "        "));
    lines.push("      </cl:group>");
    return lines.join("\n");
  }

  function generateLabeledControl(field, sid, row, col, mode) {
    var lines = [];
    var idSuffix = toPascal(field.name);
    var labelId = "opt" + (mode === "search" ? "Search" : "Form") + idSuffix;
    lines.push('        <cl:output std:sid="' + sid.next("output") + '" id="' + xmlAttr(labelId) + '" class="label' + (field.required ? " require" : "") + '" value="' + xmlAttr(field.label) + '">');
    lines.push('          <cl:formdata std:sid="' + sid.next("f-data") + '" row="' + row + '" col="' + col + '"/>');
    lines.push("        </cl:output>");
    lines.push(generateControl(field, sid, row, col + 1, mode));
    return lines.join("\n");
  }

  function generateControl(field, sid, row, col, mode) {
    var id = controlId(field);
    var fieldLabel = xmlAttr(field.label);
    var required = field.required ? '\n          <cl:attribute name="required" value="Y"/>' : "";
    var bind = '\n          <cl:relativebind property="value" columnname="' + xmlAttr(field.name) + '"/>';
    var formData = '\n          <cl:formdata std:sid="' + sid.next("f-data") + '" row="' + row + '" col="' + col + '"/>';
    var itemLabel = mode === "search" ? "전체" : "선택";

    if (field.control === "combobox") {
      return [
        '        <cl:combobox std:sid="' + sid.next("c-box") + '" id="' + xmlAttr(id) + '" fieldLabel="' + fieldLabel + '" preventinput="true">',
        required,
        bind,
        formData,
        '          <cl:item std:sid="' + sid.next("t-item") + '" label="' + itemLabel + '" value=""/>',
        '          <cl:item std:sid="' + sid.next("t-item") + '" label="Y" value="Y"/>',
        '          <cl:item std:sid="' + sid.next("t-item") + '" label="N" value="N"/>',
        '        </cl:combobox>'
      ].join("");
    }

    if (field.control === "dateinput") {
      return [
        '        <cl:dateinput std:sid="' + sid.next("d-input") + '" id="' + xmlAttr(id) + '" fieldLabel="' + fieldLabel + '" mask="YYYY-MM-DD" format="YYYYMMDD">',
        required,
        bind,
        formData,
        '        </cl:dateinput>'
      ].join("");
    }

    if (field.control === "textarea") {
      return [
        '        <cl:textarea std:sid="' + sid.next("t-area") + '" id="' + xmlAttr(id) + '" fieldLabel="' + fieldLabel + '">',
        required,
        bind,
        formData,
        '        </cl:textarea>'
      ].join("");
    }

    return [
      '        <cl:inputbox std:sid="' + sid.next("i-box") + '" id="' + xmlAttr(id) + '" fieldLabel="' + fieldLabel + '">',
      required,
      bind,
      formData,
      '        </cl:inputbox>'
    ].join("");
  }

  function generateGrid(model, fields, sid, rowIndex) {
    var lines = [];
    var height = clampInt(model.gridHeight, 120, 1200, 360);
    lines.push('      <cl:grid std:sid="' + sid.next("grid") + '" id="grdList" fieldLabel="' + xmlAttr(model.screenTitle + " 목록") + '" datasetid="dsList">');
    lines.push('        <cl:formdata std:sid="' + sid.next("f-data") + '" row="' + rowIndex + '" col="0" height="' + height + '"/>');
    fields.forEach(function (field) {
      lines.push('        <cl:gridcolumn std:sid="' + sid.next("g-column") + '" width="' + xmlAttr(field.width) + 'px"/>');
    });
    lines.push('        <cl:gridheader std:sid="' + sid.next("gh-band") + '">');
    lines.push('          <cl:gridrow std:sid="' + sid.next("g-row") + '" height="28px"/>');
    fields.forEach(function (field, index) {
      lines.push('          <cl:gridcell std:sid="' + sid.next("gh-cell") + '" rowindex="0" colindex="' + index + '" targetcolumnname="' + xmlAttr(field.name) + '" text="' + xmlAttr(field.label) + '"/>');
    });
    lines.push("        </cl:gridheader>");
    lines.push('        <cl:griddetail std:sid="' + sid.next("gd-band") + '">');
    lines.push('          <cl:gridrow std:sid="' + sid.next("g-row") + '" height="28px"/>');
    fields.forEach(function (field, index) {
      var style = field.type === "number" ? ' style="text-align:right;"' : "";
      lines.push('          <cl:gridcell std:sid="' + sid.next("gd-cell") + '" rowindex="0" colindex="' + index + '"' + style + ' columnname="' + xmlAttr(field.name) + '"/>');
    });
    lines.push("        </cl:griddetail>");
    lines.push("      </cl:grid>");
    return lines.join("\n");
  }

  function generateFooterButtons(model, sid, rowIndex) {
    var lines = [];
    lines.push('      <cl:group std:sid="' + sid.next("group") + '" id="grpButtons">');
    lines.push('        <cl:formdata std:sid="' + sid.next("f-data") + '" row="' + rowIndex + '" col="0"/>');
    if (model.templateType === "form" && model.includeReset) {
      lines.push(generateButton("btnReset", "초기화", "onBtnResetClick", sid, "        ", "78px"));
    }
    if (model.includeAdd) {
      lines.push(generateButton("btnAdd", "추가", "onBtnAddClick", sid, "        ", "78px"));
    }
    if (model.includeDelete) {
      lines.push(generateButton("btnDelete", "삭제", "onBtnDeleteClick", sid, "        ", "78px"));
    }
    if (model.includeSave) {
      lines.push(generateButton("btnSave", "저장", "onBtnSaveClick", sid, "        ", "78px"));
    }
    lines.push('        <cl:flowlayout std:sid="' + sid.next("f-layout") + '" scrollable="false" hspacing="8" vspacing="0" halign="right" valign="middle"/>');
    lines.push("      </cl:group>");
    return lines.join("\n");
  }

  function generatePopupButtons(model, sid, rowIndex) {
    var lines = [];
    lines.push('      <cl:group std:sid="' + sid.next("group") + '" id="grpButtons">');
    lines.push('        <cl:formdata std:sid="' + sid.next("f-data") + '" row="' + rowIndex + '" col="0"/>');
    lines.push(generateButton("btnConfirm", "선택", "onBtnConfirmClick", sid, "        ", "78px"));
    lines.push(generateButton("btnClose", "닫기", "onBtnCloseClick", sid, "        ", "78px"));
    lines.push('        <cl:flowlayout std:sid="' + sid.next("f-layout") + '" scrollable="false" hspacing="8" vspacing="0" halign="right" valign="middle"/>');
    lines.push("      </cl:group>");
    return lines.join("\n");
  }

  function generateButton(id, label, handler, sid, indent, width) {
    return [
      indent + '<cl:button std:sid="' + sid.next("button") + '" id="' + xmlAttr(id) + '" value="' + xmlAttr(label) + '">',
      indent + '  <cl:listener std:sid="' + sid.next("listener") + '" name="click" handler="' + xmlAttr(handler) + '"/>',
      indent + '  <cl:flowlayoutdata std:sid="' + sid.next("f-data") + '" width="' + xmlAttr(width || "80px") + '" height="28px"/>',
      indent + '</cl:button>'
    ].join("\n");
  }

  function generateFormLayout(rowCount, perRow, labelWidth, includeButtonColumn, sid, indent) {
    var lines = [];
    lines.push(indent + '<cl:formlayout std:sid="' + sid.next("f-layout") + '" scrollable="false" hspace="8px" vspace="8px">');
    for (var row = 0; row < rowCount; row++) {
      lines.push(indent + '  <cl:rows length="32" unit="PIXEL"/>');
    }
    for (var col = 0; col < perRow; col++) {
      lines.push(indent + '  <cl:columns length="' + labelWidth + '" unit="PIXEL"/>');
      lines.push(indent + '  <cl:columns length="1" unit="FRACTION"/>');
    }
    if (includeButtonColumn) {
      lines.push(indent + '  <cl:columns length="176" unit="PIXEL"/>');
    }
    lines.push(indent + "</cl:formlayout>");
    return lines.join("\n");
  }

  function generateRootLayout(rows, sid) {
    var lines = [];
    lines.push('      <cl:formlayout std:sid="' + sid.next("f-layout") + '" scrollable="false" hspace="0px" vspace="10px">');
    rows.forEach(function (row) {
      lines.push('        <cl:rows length="' + row.length + '" unit="' + row.unit + '"/>');
    });
    lines.push('        <cl:columns length="1" unit="FRACTION"/>');
    lines.push("      </cl:formlayout>");
    return lines.join("\n");
  }

  function generateJs(model, parsed) {
    var lines = [];
    var date = new Date();
    var isList = model.templateType === "list";
    var isForm = model.templateType === "form";
    var isPopup = model.templateType === "popup";
    var mapId = isForm || isPopup ? "dmForm" : "dmSearch";
    var requiredSearch = parsed.searchFields.filter(function (field) { return field.required; }).map(jsFieldMeta);
    var requiredData = parsed.dataFields.filter(function (field) { return field.required; }).map(jsFieldMeta);

    lines.push("/************************************************");
    lines.push(" * @파일명: " + getFileBaseName(model) + ".js");
    lines.push(" * @화면명: " + model.screenTitle);
    lines.push(" * @작성자: " + (cleanText(model.author) || "eXBuilder6 화면 마법사"));
    lines.push(" * @작성일: " + date.getFullYear() + ". " + pad2(date.getMonth() + 1) + ". " + pad2(date.getDate()) + ".");
    lines.push(" ************************************************/");
    lines.push("");
    if (model.includeCommonUtil) {
      lines.push("var util = typeof createCommonUtil === \"function\" ? createCommonUtil() : null;");
    } else {
      lines.push("var util = null;");
    }
    lines.push("");
    lines.push("var REQUIRED_SEARCH_FIELDS = " + JSON.stringify(requiredSearch, null, 2) + ";");
    lines.push("var REQUIRED_DATA_FIELDS = " + JSON.stringify(requiredData, null, 2) + ";");
    lines.push("");
    lines.push("function onBodyLoad(e) {");
    if (isPopup) {
      lines.push("  applyPopupInitValue();");
    } else if (model.includeSearch) {
      lines.push("  focusFirstControl(\"" + jsString(mapId) + "\");");
    } else {
      lines.push("  // 초기 화면 상태를 설정합니다.");
    }
    lines.push("}");
    lines.push("");
    lines.push(generateSharedJs());

    if (isList) {
      lines.push(generateListJs(model));
    } else if (isForm) {
      lines.push(generateFormJs(model));
    } else {
      lines.push(generatePopupJs(model, parsed));
    }

    return lines.join("\n");
  }

  function generateSharedJs() {
    return [
      "function isEmpty(value) {",
      "  return value === null || value === undefined || String(value).trim() === \"\";",
      "}",
      "",
      "function alertMessage(message) {",
      "  if (util && util.Msg && util.Msg.alert) {",
      "    util.Msg.alert(app, message);",
      "    return;",
      "  }",
      "  alert(message);",
      "}",
      "",
      "function confirmMessage(message, callback) {",
      "  if (util && util.Msg && util.Msg.confirm) {",
      "    util.Msg.confirm(app, message, \"\", callback);",
      "    return;",
      "  }",
      "  if (confirm(message)) callback();",
      "}",
      "",
      "function sendSubmission(submissionId, callback) {",
      "  if (util && util.Submit && util.Submit.send) {",
      "    util.Submit.send(app, submissionId, function(success) {",
      "      if (callback) callback(success);",
      "    });",
      "    return;",
      "  }",
      "  var submission = app.lookup(submissionId);",
      "  if (!submission || !submission.send) {",
      "    alertMessage(\"Submission을 찾을 수 없습니다: \" + submissionId);",
      "    return;",
      "  }",
      "  submission.send();",
      "  if (callback) callback(true);",
      "}",
      "",
      "function focusFirstControl(dataMapId) {",
      "  var dataMap = app.lookup(dataMapId);",
      "  if (!dataMap) return;",
      "  try {",
      "    var controls = app.getContainer().getAllRecursiveChildren();",
      "    for (var i = 0; i < controls.length; i++) {",
      "      if (controls[i].focus && controls[i].type !== \"output\") {",
      "        controls[i].focus();",
      "        return;",
      "      }",
      "    }",
      "  } catch (e) {}",
      "}",
      "",
      "function validateMap(dataMapId, requiredFields) {",
      "  var dataMap = app.lookup(dataMapId);",
      "  if (!dataMap) {",
      "    alertMessage(\"DataMap을 찾을 수 없습니다: \" + dataMapId);",
      "    return false;",
      "  }",
      "  for (var i = 0; i < requiredFields.length; i++) {",
      "    var field = requiredFields[i];",
      "    if (isEmpty(dataMap.getValue(field.name))) {",
      "      alertMessage(field.label + \"을(를) 입력해 주세요.\");",
      "      return false;",
      "    }",
      "  }",
      "  return true;",
      "}",
      "",
      "function validateRows(dataSetId, requiredFields) {",
      "  var dataSet = app.lookup(dataSetId);",
      "  if (!dataSet) {",
      "    alertMessage(\"DataSet을 찾을 수 없습니다: \" + dataSetId);",
      "    return false;",
      "  }",
      "  for (var row = 0; row < dataSet.getRowCount(); row++) {",
      "    for (var i = 0; i < requiredFields.length; i++) {",
      "      var field = requiredFields[i];",
      "      if (isEmpty(dataSet.getValue(row, field.name))) {",
      "        alertMessage((row + 1) + \"행의 \" + field.label + \"을(를) 입력해 주세요.\");",
      "        return false;",
      "      }",
      "    }",
      "  }",
      "  return true;",
      "}",
      "",
      "function hasChangedRows(dataSetId) {",
      "  var dataSet = app.lookup(dataSetId);",
      "  if (!dataSet) return false;",
      "  var unchanged = cpr.data.tabledata.RowState.UNCHANGED;",
      "  for (var i = 0; i < dataSet.getRowCount(); i++) {",
      "    if (dataSet.getRowState(i) !== unchanged) return true;",
      "  }",
      "  return false;",
      "}",
      ""
    ].join("\n");
  }

  function generateListJs(model) {
    var lines = [];
    if (model.includeSearch) {
      lines.push("function doSearch() {");
      lines.push("  if (!validateMap(\"dmSearch\", REQUIRED_SEARCH_FIELDS)) return;");
      lines.push("  sendSubmission(\"subList\", function(success) {");
      lines.push("    if (success && util && util.Msg && util.Msg.notify) {");
      lines.push("      util.Msg.notify(app, \"INF-M001\");");
      lines.push("    }");
      lines.push("  });");
      lines.push("}");
      lines.push("");
      lines.push("function onBtnSearchClick(e) {");
      lines.push("  doSearch();");
      lines.push("}");
      lines.push("");
    }
    if (model.includeReset) {
      lines.push("function onBtnResetClick(e) {");
      lines.push("  var dmSearch = app.lookup(\"dmSearch\");");
      lines.push("  if (dmSearch && dmSearch.clear) dmSearch.clear();");
      lines.push("  focusFirstControl(\"dmSearch\");");
      lines.push("}");
      lines.push("");
    }
    if (model.includeAdd) {
      lines.push("function onBtnAddClick(e) {");
      lines.push("  var dsList = app.lookup(\"dsList\");");
      lines.push("  if (!dsList) return;");
      lines.push("  if (dsList.insertRowData) {");
      lines.push("    dsList.insertRowData(dsList.getRowCount(), true, {});");
      lines.push("  } else if (dsList.addRow) {");
      lines.push("    dsList.addRow();");
      lines.push("  }");
      lines.push("}");
      lines.push("");
    }
    if (model.includeSave) {
      lines.push("function onBtnSaveClick(e) {");
      lines.push("  if (!hasChangedRows(\"dsList\")) {");
      lines.push("    alertMessage(\"저장할 변경사항이 없습니다.\");");
      lines.push("    return;");
      lines.push("  }");
      lines.push("  if (!validateRows(\"dsList\", REQUIRED_DATA_FIELDS)) return;");
      lines.push("  confirmMessage(\"저장하시겠습니까?\", function() {");
      lines.push("    sendSubmission(\"subSave\", function(success) {");
      lines.push("      if (success) doSearch();");
      lines.push("    });");
      lines.push("  });");
      lines.push("}");
      lines.push("");
    }
    if (model.includeDelete) {
      lines.push("function onBtnDeleteClick(e) {");
      lines.push("  var grid = app.lookup(\"grdList\");");
      lines.push("  var dsList = app.lookup(\"dsList\");");
      lines.push("  if (!grid || !dsList) return;");
      lines.push("  var indices = grid.getCheckRowIndices ? grid.getCheckRowIndices() : [];");
      lines.push("  if (!indices.length && grid.getSelectedRowIndex) {");
      lines.push("    var selected = grid.getSelectedRowIndex();");
      lines.push("    if (selected >= 0) indices = [selected];");
      lines.push("  }");
      lines.push("  if (!indices.length) {");
      lines.push("    alertMessage(\"삭제할 행을 선택해 주세요.\");");
      lines.push("    return;");
      lines.push("  }");
      lines.push("  confirmMessage(\"선택한 행을 삭제하시겠습니까?\", function() {");
      lines.push("    for (var i = indices.length - 1; i >= 0; i--) {");
      lines.push("      dsList.deleteRow(indices[i]);");
      lines.push("    }");
      lines.push("    sendSubmission(\"subDelete\", function(success) {");
      lines.push("      if (success) doSearch();");
      lines.push("    });");
      lines.push("  });");
      lines.push("}");
      lines.push("");
    }
    return lines.join("\n");
  }

  function generateFormJs(model) {
    var lines = [];
    if (model.includeSearch) {
      lines.push("function doSearch() {");
      lines.push("  if (!validateMap(\"dmForm\", REQUIRED_SEARCH_FIELDS)) return;");
      lines.push("  sendSubmission(\"subList\");");
      lines.push("}");
      lines.push("");
      lines.push("function onBtnSearchClick(e) {");
      lines.push("  doSearch();");
      lines.push("}");
      lines.push("");
    }
    if (model.includeReset) {
      lines.push("function onBtnResetClick(e) {");
      lines.push("  var dmForm = app.lookup(\"dmForm\");");
      lines.push("  if (dmForm && dmForm.clear) dmForm.clear();");
      lines.push("  focusFirstControl(\"dmForm\");");
      lines.push("}");
      lines.push("");
    }
    if (model.includeSave) {
      lines.push("function onBtnSaveClick(e) {");
      lines.push("  if (!validateMap(\"dmForm\", REQUIRED_DATA_FIELDS)) return;");
      lines.push("  confirmMessage(\"저장하시겠습니까?\", function() {");
      lines.push("    sendSubmission(\"subSave\");");
      lines.push("  });");
      lines.push("}");
      lines.push("");
    }
    return lines.join("\n");
  }

  function generatePopupJs(model, parsed) {
    var resultFields = parsed.dataFields.map(function (field) { return field.name; });
    return [
      "function getPopupInitValue() {",
      "  try {",
      "    if (window.__" + sanitizeIdentifier(model.screenId, "popup") + "Init) return window.__" + sanitizeIdentifier(model.screenId, "popup") + "Init;",
      "  } catch (e) {}",
      "  try {",
      "    if (window.top.__" + sanitizeIdentifier(model.screenId, "popup") + "Init) return window.top.__" + sanitizeIdentifier(model.screenId, "popup") + "Init;",
      "  } catch (e) {}",
      "  return {};",
      "}",
      "",
      "function applyPopupInitValue() {",
      "  var initValue = getPopupInitValue();",
      "  var dmForm = app.lookup(\"dmForm\");",
      "  if (!dmForm) return;",
      "  Object.keys(initValue).forEach(function(key) {",
      "    try { dmForm.setValue(key, initValue[key]); } catch (e) {}",
      "  });",
      "}",
      "",
      "function closePopup(result) {",
      "  try { window.__" + sanitizeIdentifier(model.screenId, "popup") + "Result = result; } catch (e) {}",
      "  try { window.top.__" + sanitizeIdentifier(model.screenId, "popup") + "Result = result; } catch (e) {}",
      "  try { app.close(result); return; } catch (e) {}",
      "  try { if (app.getHost && app.getHost()) app.getHost().close(result); } catch (e) {}",
      "}",
      "",
      "function getSelectedRowData() {",
      "  var grid = app.lookup(\"grdList\");",
      "  var dsList = app.lookup(\"dsList\");",
      "  if (!grid || !dsList || !grid.getSelectedRowIndex) return null;",
      "  var rowIndex = grid.getSelectedRowIndex();",
      "  if (rowIndex < 0) return null;",
      "  var result = {};",
      "  var fields = " + JSON.stringify(resultFields, null, 2) + ";",
      "  fields.forEach(function(name) {",
      "    result[name] = dsList.getValue(rowIndex, name);",
      "  });",
      "  return result;",
      "}",
      "",
      "function doSearch() {",
      "  if (!validateMap(\"dmForm\", REQUIRED_SEARCH_FIELDS)) return;",
      "  sendSubmission(\"subList\");",
      "}",
      "",
      "function onBtnSearchClick(e) {",
      "  doSearch();",
      "}",
      "",
      "function onBtnResetClick(e) {",
      "  var dmForm = app.lookup(\"dmForm\");",
      "  if (dmForm && dmForm.clear) dmForm.clear();",
      "  focusFirstControl(\"dmForm\");",
      "}",
      "",
      "function onBtnConfirmClick(e) {",
      "  var rowData = getSelectedRowData();",
      "  if (!rowData) {",
      "    alertMessage(\"선택할 행을 클릭해 주세요.\");",
      "    return;",
      "  }",
      "  closePopup({ RESULT: \"OK\", DATA: rowData });",
      "}",
      "",
      "function onBtnCloseClick(e) {",
      "  closePopup({ RESULT: \"CLOSE\" });",
      "}",
      ""
    ].join("\n");
  }

  function summarizeLogic(model) {
    var names = [];
    if (model.includeSearch) names.push("조회");
    if (model.includeReset) names.push("초기화");
    if (model.includeAdd) names.push("추가");
    if (model.includeSave) names.push("저장");
    if (model.includeDelete) names.push("삭제");
    if (model.templateType === "popup") names.push("선택 반환");
    return names.length ? names.join(" / ") : "이벤트 없음";
  }

  function searchGroupHeight(model, fields) {
    var perRow = clampInt(model.controlsPerRow, 1, 4, 2);
    return Math.max(1, Math.ceil(Math.max(fields.length, 1) / perRow)) * 40 + 18;
  }

  function controlId(field) {
    var prefix = {
      combobox: "cmb",
      dateinput: "dti",
      textarea: "txa",
      inputbox: "ipb"
    }[field.control] || "ipb";
    return prefix + toPascal(field.name);
  }

  function jsFieldMeta(field) {
    return { name: field.name, label: field.label };
  }

  function getFileBaseName(model) {
    var source = model || normalizeState(state);
    return sanitizeFileName(source.fileBaseName || source.screenId || "sampleScreen");
  }

  function copyText(text, message) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast(message);
      }).catch(function () {
        fallbackCopy(text, message);
      });
      return;
    }
    fallbackCopy(text, message);
  }

  function fallbackCopy(text, message) {
    var area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.focus();
    area.select();
    try {
      document.execCommand("copy");
      showToast(message);
    } catch (error) {
      showToast("복사하지 못했습니다.");
    }
    document.body.removeChild(area);
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
    showToast(fileName + " 파일을 만들었습니다.");
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () {
      els.toast.classList.remove("is-visible");
    }, 1800);
  }

  function SidFactory() {
    this.index = 0;
  }

  SidFactory.prototype.next = function (prefix) {
    this.index += 1;
    var value = ((this.index * 2654435761) >>> 0).toString(16);
    return prefix + "-" + ("00000000" + value).slice(-8);
  };

  function normalizeDataType(value) {
    var type = cleanText(value).toLowerCase();
    if (["number", "int", "integer", "decimal"].indexOf(type) >= 0) return "number";
    if (["date", "datetime"].indexOf(type) >= 0) return "string";
    if (["boolean", "bool"].indexOf(type) >= 0) return "string";
    return "string";
  }

  function normalizeControl(value, type, name) {
    var control = cleanText(value).toLowerCase();
    if (["combo", "combobox", "select"].indexOf(control) >= 0) return "combobox";
    if (["date", "dateinput", "calendar"].indexOf(control) >= 0) return "dateinput";
    if (["textarea", "text", "multiline"].indexOf(control) >= 0) return "textarea";
    if (/(_DT|_YMD|DATE)$/.test(name)) return "dateinput";
    if (/(^|_)YN$/.test(name) || /_CD$/.test(name)) return "combobox";
    if (type === "number") return "inputbox";
    return "inputbox";
  }

  function defaultColumnWidth(type, control) {
    if (control === "dateinput") return "110";
    if (control === "combobox") return "90";
    if (control === "textarea") return "240";
    if (type === "number") return "90";
    return "140";
  }

  function sanitizeColumnName(value) {
    var name = String(value || "").trim().replace(/\s+/g, "_").replace(/[^\w]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
    if (!name) name = "COLUMN";
    if (/^\d/.test(name)) name = "C_" + name;
    return name.toUpperCase();
  }

  function sanitizeIdentifier(value, fallback) {
    var id = String(value || "").trim().replace(/[^A-Za-z0-9_$]/g, "");
    if (!id) id = fallback || "sampleScreen";
    if (/^\d/.test(id)) id = "app" + id;
    return id;
  }

  function sanitizeFileName(value) {
    var name = String(value || "").trim().replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "");
    return name || "sampleScreen";
  }

  function humanizeColumn(value) {
    return String(value || "").split("_").map(function (part) {
      return part ? part.charAt(0) + part.slice(1).toLowerCase() : "";
    }).join(" ");
  }

  function toPascal(value) {
    return String(value || "").split(/[_\s-]+/).filter(Boolean).map(function (part) {
      var lower = part.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }).join("");
  }

  function toCamel(value) {
    var pascal = toPascal(value);
    return pascal ? pascal.charAt(0).toLowerCase() + pascal.slice(1) : "";
  }

  function cleanText(value) {
    return String(value == null ? "" : value).trim();
  }

  function clampInt(value, min, max, fallback) {
    var number = parseInt(value, 10);
    if (!Number.isFinite(number)) number = fallback;
    return Math.max(min, Math.min(max, number));
  }

  function merge() {
    var result = {};
    Array.prototype.slice.call(arguments).forEach(function (source) {
      Object.keys(source || {}).forEach(function (key) {
        result[key] = source[key];
      });
    });
    return result;
  }

  function mergeFields() {
    var seen = {};
    var result = [];
    Array.prototype.slice.call(arguments).forEach(function (list) {
      (list || []).forEach(function (field) {
        if (!field || seen[field.name]) return;
        seen[field.name] = true;
        result.push(field);
      });
    });
    return result;
  }

  function repeat(value, count) {
    return new Array(count + 1).join(value);
  }

  function xmlAttr(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;"
      }[char];
    });
  }

  function jsString(value) {
    return String(value == null ? "" : value).replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
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

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  function formatTime(date) {
    return pad2(date.getHours()) + ":" + pad2(date.getMinutes()) + ":" + pad2(date.getSeconds());
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }
})();
