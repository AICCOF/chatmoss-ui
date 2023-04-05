import { ModalMethods } from "./types";

export function useModel() {
  let model: ModalMethods ;
  function register(methods: ModalMethods) {

    model = methods;
  }

  return [register,{

    openModel:()=>{
      model && model.openModel();
    },
    closeModel:()=>{
      model && model.closeModel();
    }
  }] as [typeof register, ModalMethods]
  
}