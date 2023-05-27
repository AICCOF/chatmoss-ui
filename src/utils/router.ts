
import { useRouter, useRoute, Router } from 'vue-router'

function isString(val:any) {
  const type = Object.prototype.toString.call(val);
  if (type === '[object string]') {
    return true;
  }
  return false;
}


function handleError(e:any) {
  console.error(e);
}

// 切换路由
export function useGo(_router?:any) {
  let router;
  if (!_router) {
    router = useRouter();
  }
  const { push, replace } = _router || router;
  function go(opt:any, is_replace = false) {
    if (!opt) return;
    if (isString(_router)) {
      is_replace ? replace(opt).catch(handleError) : push(opt).catch(handleError);
    } else {
      const o = opt;
      is_replace ? replace(o).catch(handleError) : push(o).catch(handleError);
    }
  }
  return go;
}

export function useBack() {
  let router = useRouter();
  function back() {
    router.go(-1);
  }
  return back;
}

