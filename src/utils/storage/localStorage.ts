


export let localStorage = {
  getItem:(key:string)=>{
    return window.localStorage.getItem(key)
  },
  setItem: (key: string, value: string)=>{
    return window.localStorage.setItem(key, value)
  },
  clear(){
    return window.localStorage.clear()
  },
  removeItem: (key: string)=>{
    return window.localStorage.removeItem(key)
  }

}