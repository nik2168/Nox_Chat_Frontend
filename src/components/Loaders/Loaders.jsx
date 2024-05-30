import React from 'react'
import { Skeleton, Backdrop } from '@mui/material'

const Loaders = () => {
  return (
    <>
    <div>
      <Skeleton
        variant="rounded"
        height={"100vh"}
        width={"20vw"}
        sx={{ backgroundColor: "#637381" }}
        />
      </div>
      <div>

      <Skeleton
        variant="rounded"
        height={"100vh"}
        width={"30vw"}
        sx={{ backgroundColor: "#C4CDD5" }}
        />
        </div>
        <div>
      <Skeleton
        variant="rounded"
        height={"100vh"}
        width={"50vw"}
        sx={{ backgroundColor: "#454F5B" }}
        />
      {/* <Backdrop open/> */}
    </div>
        </>
  );
}

export default Loaders