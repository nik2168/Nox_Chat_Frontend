import React, { useState } from "react";

export const useName = (def) => {
  const [curname, setname] = useState(def);

  let nameFlag = false; // false means valid, true means invalid
  let nameErr = "No Error";
  
  if (curname.length === 0) {
    nameFlag = true; // invalid if empty
    nameErr = "Name is required";
    return { curname, setname, nameFlag, nameErr };
  }
  
  if (curname.length >= 10) {
    nameFlag = true; // invalid if too long
    nameErr = "Name length must be < 10";
    return { curname, setname, nameFlag, nameErr };
  }
  
  for (let i = 0; i < curname.length; i++) {
    let code = curname.charCodeAt(i);
    if (code < 65 || (code > 90 && code < 97) || code > 122) {
      nameFlag = true; // invalid if contains non-alphabetic characters
      nameErr = "Use alphabets only !";
      break;
    }
  }

  return { curname, setname, nameFlag, nameErr };
};

export const useUserName = (def) => {
  const [user, setuser] = useState(def);

  let userFlag = false; // false means valid, true means invalid
  let userErr = "No Error";
  
  if (user.length === 0) {
    userFlag = true; // invalid if empty
    userErr = "Username is required";
    return { user, setuser, userFlag, userErr };
  }
  
  if (user.length >= 10) {
    userFlag = true; // invalid if too long
    userErr = "Username length must be < 10";
    return { user, setuser, userFlag, userErr };
  }
  
  let alphabetCheck = false;
  let digitCheck = false;
  for (let i = 0; i < user.length; i++) {
    let code = user.charCodeAt(i);
    if (code >= 48 && code <= 57) digitCheck = true;
    if(code >= 97 && code <= 122) alphabetCheck = true;
  }
  
  userFlag = !(digitCheck && alphabetCheck); // invalid if doesn't have both
  if(userFlag) userErr = "Username must have small alphabets and digits only"

  return { user, setuser, userFlag, userErr };
};

export const useBio = (def) => {
  const [bio, setbio] = useState(def);
  let bioFlag = false; // false means valid, true means invalid
  let bioErr = "No Error"
  if(bio.length > 40) {
    bioFlag = true; // invalid if too long
    bioErr = "Bio length must be < 40"
  }
  return { bio, setbio,  bioFlag, bioErr};
};

export const usePassword = (def) => {
  const [pass, setpass] = useState(def);
  let passFlag = false; // false means valid, true means invalid
  let passErr = 'No Err';
  
  if (pass.length === 0) {
    passFlag = true; // invalid if empty
    passErr = "Password is required";
    return {pass, setpass, passFlag, passErr}
  }
  
  if(pass.length >= 10) {
    passFlag = true; // invalid if too long
    passErr = "Password length must be < 10"
    return {pass, setpass, passFlag, passErr}
  }

   let specialCharacter = false;
   let digit = false;
   let capitalAlpha = false;
   let smallAlpha = false;
   let size = false;

   if (pass.length > 6) size = true;
   for (let i = 0; i < pass.length; i++) {
     let code = pass.charCodeAt(i);

     if (code >= 48 && code <= 57) digit = true; // Fixed: was >= 57, should be <= 57
     if (code > 64 && code < 91) capitalAlpha = true;
     if (code > 96 && code < 123) smallAlpha = true;
     if (
       (code > 33 && code < 48) ||
       (code > 57 && code < 65) ||
       (code > 90 && code < 97) ||
       (code > 122 && code < 127)
     )
       specialCharacter = true;
   }
   
   // Invalid if doesn't meet all requirements
   passFlag = !(specialCharacter && digit && capitalAlpha && smallAlpha && size);

   if(passFlag) passErr = "Password must have special char, capital & small alphabet and a digit"

  return { pass, setpass, passFlag, passErr};
};

export const useFileValidator = (def) => {
  const [file, setFile] = useState(def);
  let fileFlag = true;
  let fileErr = "No Err"
        // if (e.target.files[0].size > 1000000) {
        //   fileFlag = false;
        //   fileErr = "image size must be < 1mb";
        // }
  return  {file, setFile, fileFlag, fileErr}
}

