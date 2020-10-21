import React from "react";

const ConnectSuccess = () => {
  //   const page = document.getElementsByClassName(`page-wrapper`)[0];

  //   if (page) {
  //     page.classList.add("bg-gradient-primary");
  //     page.classList.add("text-white");
  //   }

  //   const successStyle = {
  //     color: "#ff9900",
  //   };

  return (
    <div className="text-center">
      <h1 className="display-2">Thank You!</h1>
      <h1 className="display-7">
        {"You've successfully connected to Stripe."}
      </h1>
    </div>
  );
};

export default ConnectSuccess;
