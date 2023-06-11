interface Window {
  $loadingBar?: import('naive-ui').LoadingBarProviderInst;
  $dialog?: import('naive-ui').DialogProviderInst;
  $message?: import('naive-ui').MessageProviderInst;
  $notification?: import('naive-ui').NotificationProviderInst;
  chatStorage: any;

}

declare module '@dcloudio/uni-webview-js';

declare let acquireVsCodeApi: () => void;
