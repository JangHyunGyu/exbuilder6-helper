(function () {
  "use strict";

  window.EX6_HELPER_CONFIG = {
    version: "1.1.0",
    defaultProfile: "standard",
    utilFactory: "createCommonUtil",

    defaults: {
      projectProfile: "standard",
      screenTitle: "사용자 목록",
      screenId: "userList",
      fileBaseName: "userList",
      appPath: "app/sample/userList",
      screenWidth: "1280",
      screenHeight: "620",
      controlsPerRow: "2",
      labelWidth: "90",
      gridHeight: "360"
    },

    profiles: {
      standard: {
        label: "기본",
        appPathPrefix: "app/sample",
        endpointPrefix: "/sample",
        utilFactory: "createCommonUtil"
      },
      admin: {
        label: "관리자",
        appPathPrefix: "app/admin",
        endpointPrefix: "/admin",
        utilFactory: "createCommonUtil"
      },
      portal: {
        label: "포털",
        appPathPrefix: "app/portal",
        endpointPrefix: "/portal",
        utilFactory: "createCommonUtil"
      }
    },

    endpointPatterns: {
      search: "{prefix}/select{ScreenId}.do",
      save: "{prefix}/save{ScreenId}.do",
      delete: "{prefix}/delete{ScreenId}.do"
    },

    messages: {
      searchSuccessCode: "INF-M001",
      saveConfirm: "저장하시겠습니까?",
      deleteConfirm: "선택한 행을 삭제하시겠습니까?",
      noChangedRows: "저장할 변경사항이 없습니다.",
      deleteSelectRequired: "삭제할 행을 선택해 주세요.",
      popupSelectRequired: "선택할 행을 클릭해 주세요."
    },

    controlAliases: {
      combo: "combobox",
      select: "combobox",
      date: "dateinput",
      calendar: "dateinput",
      text: "textarea",
      multiline: "textarea"
    },

    controlRules: [
      { pattern: "(_DT|_YMD|DATE)$", control: "dateinput" },
      { pattern: "(^|_)YN$|_CD$", control: "combobox" }
    ],

    controlPrefixes: {
      inputbox: "ipb",
      combobox: "cmb",
      dateinput: "dti",
      textarea: "txa"
    },

    defaultColumnWidths: {
      inputbox: "140",
      combobox: "90",
      dateinput: "110",
      textarea: "240",
      number: "90"
    },

    codeItems: {
      USE_YN: [
        { label: "Y", value: "Y" },
        { label: "N", value: "N" }
      ]
    }
  };
})();
