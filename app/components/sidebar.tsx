import { useState, useEffect, useRef } from "react";

import styles from "./home.module.scss";

import { IconButton } from "./button";
import SettingsIcon from "../icons/settings.svg";
import BookOpenIcon from "../icons/book-open.svg";
import LoginIcon from "../icons/login.svg";
import ChatGptIcon from "../icons/chatgpt.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import MaskIcon from "../icons/mask.svg";
import PluginIcon from "../icons/plugin.svg";
import PromptIcon from "../icons/prompt.svg";
import { Popconfirm } from "antd";

import Locale from "../locales";

import { Modal } from "./ui-lib";
import { useAppConfig, useAuthStore, useChatStore } from "../store";
import { useWebsiteConfigStore, useNoticeConfigStore } from "../store";

import {
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  NARROW_SIDEBAR_WIDTH,
  Path,
  // REPO_URL,
} from "../constant";

import { Link, useNavigate } from "react-router-dom";
import { useMobileScreen } from "../utils";
import dynamic from "next/dynamic";
import { showToast } from "./ui-lib";

const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
  loading: () => null,
});

function useHotKey() {
  const chatStore = useChatStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.altKey || e.ctrlKey) {
        const n = chatStore.sessions.length;
        const limit = (x: number) => (x + n) % n;
        const i = chatStore.currentSessionIndex;
        if (e.key === "ArrowUp") {
          chatStore.selectSession(limit(i - 1));
        } else if (e.key === "ArrowDown") {
          chatStore.selectSession(limit(i + 1));
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
}

function useDragSideBar() {
  const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

  const config = useAppConfig();
  const startX = useRef(0);
  const startDragWidth = useRef(config.sidebarWidth ?? 340);
  const lastUpdateTime = useRef(Date.now());

  const handleMouseMove = useRef((e: MouseEvent) => {
    if (Date.now() < lastUpdateTime.current + 50) {
      return;
    }
    lastUpdateTime.current = Date.now();
    const d = e.clientX - startX.current;
    const nextWidth = limit(startDragWidth.current + d);
    config.update((config) => (config.sidebarWidth = nextWidth));
  });

  const handleMouseUp = useRef(() => {
    startDragWidth.current = config.sidebarWidth ?? 340;
    window.removeEventListener("mousemove", handleMouseMove.current);
    window.removeEventListener("mouseup", handleMouseUp.current);
  });

  const onDragMouseDown = (e: MouseEvent) => {
    startX.current = e.clientX;

    window.addEventListener("mousemove", handleMouseMove.current);
    window.addEventListener("mouseup", handleMouseUp.current);
  };
  const isMobileScreen = useMobileScreen();
  const shouldNarrow =
    !isMobileScreen && config.sidebarWidth < MIN_SIDEBAR_WIDTH;

  useEffect(() => {
    const barWidth = shouldNarrow
      ? NARROW_SIDEBAR_WIDTH
      : limit(config.sidebarWidth ?? 340);
    const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
    document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
  }, [config.sidebarWidth, isMobileScreen, shouldNarrow]);

  return {
    onDragMouseDown,
    shouldNarrow,
    isMobileScreen,
  };
}

export function NoticeModel(props: { onClose: () => void }) {
  const noticeConfigStore = useNoticeConfigStore();

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Sidebar.Title}
        onClose={() => props.onClose()}
        actions={[
          <IconButton
            key="reset"
            bordered
            text={Locale.Sidebar.Close}
            onClick={() => {
              props.onClose();
            }}
          />,
        ]}
      >
        <div>
          <div
            style={{
              textAlign: "center",
              fontSize: "20px",
              lineHeight: "40px",
              marginBottom: "10px",
            }}
            dangerouslySetInnerHTML={{ __html: noticeConfigStore.title || "" }}
          ></div>
          <div
            dangerouslySetInnerHTML={{
              __html: noticeConfigStore.content || "",
            }}
          ></div>
        </div>
      </Modal>
    </div>
  );
}
export function SideBar(props: { className?: string }) {
  const chatStore = useChatStore();
  const authStore = useAuthStore();
  // const isMobileScreen = useMobileScreen();
  // drag side bar
  const { onDragMouseDown, shouldNarrow, isMobileScreen } = useDragSideBar();
  const navigate = useNavigate();
  const config = useAppConfig();

  useHotKey();

  const websiteConfigStore = useWebsiteConfigStore();
  const noticeConfigStore = useNoticeConfigStore();
  const [noticeShow, setNoticeShow] = useState(false);
  function showNotice() {
    setNoticeShow(true);
  }
  useEffect(() => {
    if (noticeConfigStore.splash) {
      showNotice();
    }
  }, [noticeConfigStore]);

  return (
    <div
      className={`${styles.sidebar} ${props.className} ${
        shouldNarrow && styles["narrow-sidebar"]
      }`}
    >
      <div className={styles["sidebar-header"]}>
        <div className={styles["sidebar-title"]}>
          {websiteConfigStore.title || "AI Chat Chat"}
        </div>
        <div className={styles["sidebar-sub-title"]}>
          {websiteConfigStore.subTitle || "Let's Chat Chat."}
        </div>
        <div className={styles["sidebar-logo"] + " no-dark"}>
          <ChatGptIcon />
        </div>
      </div>

      <div className={styles["sidebar-header-bar"]}>
        <IconButton
          icon={<MaskIcon />}
          text={shouldNarrow ? undefined : Locale.Mask.Name}
          className={styles["sidebar-bar-button"]}
          onClick={() => navigate(Path.NewChat, { state: { fromHome: true } })}
          shadow
        />
        <IconButton
          icon={<PluginIcon />}
          text={shouldNarrow ? undefined : Locale.Plugin.Name}
          className={styles["sidebar-bar-button"]}
          onClick={() => showToast(Locale.WIP)}
          shadow
        />
      </div>

      <div
        className={styles["sidebar-body"]}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            navigate(Path.Home);
          }
        }}
      >
        <ChatList narrow={shouldNarrow} />
      </div>

      <div className={styles["sidebar-tail"]}>
        <div className={styles["sidebar-actions"]}>
          <Popconfirm
            title={Locale.Home.DeleteChat}
            onConfirm={() => {
              chatStore.deleteSession(chatStore.currentSessionIndex);
            }}
            okText={Locale.UI.Confirm}
            cancelText={Locale.UI.Close}
          >
            <div className={styles["sidebar-action"] + " " + styles.mobile}>
              <IconButton icon={<CloseIcon />} />
            </div>
          </Popconfirm>
          <div className={styles["sidebar-action"]}>
            <Link to={Path.Settings}>
              <IconButton icon={<SettingsIcon />} shadow />
            </Link>
          </div>
          {/*<div className={styles["sidebar-action"]}>
            <IconButton icon={<PromptIcon />} shadow />
          </div>*/}
	        <div className={styles["sidebar-action"]}>
		        <IconButton
			        icon={<BookOpenIcon />}
			        onClick={() => {
				        if (noticeConfigStore.show) {
					        showNotice();
				        } else {
					        showToast(Locale.Home.NoNotice);
				        }
			        }}
			        shadow
		        />
	        </div>
          <div className={styles["sidebar-action"]}>
            {!authStore.token ? (
              <Link to={Path.Login}>
                <IconButton icon={<LoginIcon />} shadow />
              </Link>
            ) : (
              <Link to={Path.Profile}>
                <IconButton icon={<LoginIcon />} shadow />
              </Link>
            )}
          </div>
        </div>
        <div>
          <IconButton
            icon={<AddIcon />}
            text={
              shouldNarrow || isMobileScreen ? undefined : Locale.Home.NewChat
            }
            onClick={() => {
              if (config.dontShowMaskSplashScreen) {
                chatStore.newSession();
                navigate(Path.Chat);
              } else {
                navigate(Path.NewChat);
              }
            }}
            shadow
          />
        </div>
      </div>

      <div
        className={styles["sidebar-drag"]}
        onMouseDown={(e) => onDragMouseDown(e as any)}
      ></div>
      {noticeShow && <NoticeModel onClose={() => setNoticeShow(false)} />}
    </div>
  );
}
