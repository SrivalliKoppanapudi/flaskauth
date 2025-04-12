import React,{useContext} from 'react'
import { DisasterContext } from "../DisasterContext";

const AdminDashboard = () => {
  const { predictions } = useContext(DisasterContext);
  return (

    <div>

    
       {
          predictions.map((pred,index)=>{
            return <h3 style={{color:'white'}} key={index}>{pred}</h3>
          })
      }
      
    </div>
  )
}

export default AdminDashboard