# Cloudinary-WYSIWYG
## Project Page and link to live tool:
### Link: [joshuatz.com/projects/web-stuff/cloudinary-wysiwyg-visual-editor-for-transformations](https://joshuatz.com/projects/web-stuff/cloudinary-wysiwyg-visual-editor-for-transformations)

---

## Quick Demo:
![Quick Demo GIF](/src/readme-files/Cloudinary_WYSIWYG-Quick_Editor_Demo.gif?raw=true)

---
## Intro
This is a visual editor (also known as "what-you-see-is-what-you-get" or "WYSIWYG" editor) to arrange, visualize, and preview Cloudinary transformation combinations. It was created mostly as a proof-of-concept, since I was curious to see how far the limits on transformations can be pushed, but given the progress made with it, it has practical applications as well.

The value that this tool provides is mainly that it would be very hard, if not impossible, to manually convert dozens of editing actions (move, rotate, add a square, shift down a layer, etc.) into Cloudinary transformation strings, but this tool does it automatically.

There are tons of features that could be added to this project (support for "effects", shareable templates, etc.), but at the moment, I'm not dedicating much time or resources towards it beyond what I already made.

## Practical applications:
 -  Game Developers - Creating "Shareable" badges and achievement cards
 -  "Meme Generators"
 -  Ecommerce sites
    -   Overlay product details in text over product image
    -   Embed templated images into your product feed for use with Google Shopping, Facebook Product Catalogs, etc.
 -  Cloudinary learning tool
    -   Mess around with different combinations to see how different objects get converted into chained transformations, and subsequently into a URL string
 -  Dynamic image generation for Google Sheets or any other spreadsheet program
    -   You can use this tool to create the template, then use spreadsheet functions like CONCAT() to create the URL dynamically given values in other columns
 -   Dynamic image generation for sites that can't use server-side image manipulation - this way you can use Javascript, plus the export from this tool, to generate an ```<img>``` tag src completely 100% client side.

---

## Samples:
### Gaming Badge generated from JSON
![Gaming Badge Demo](/src/readme-files/Cloudinary_-_Dynamic_Gaming_Badge_Overlay_Generated_Example.jpg)
### Jira Daily Task Summary
![Jira Daily Task Summary](/src/readme-files/Cloudinary_-_Jira_Daily_Task_Summary_Generated_Image_Sample.jpg)

---

## Additional Resources:
 -  [https://joshuatz.com/tag/cloudinary/](https://joshuatz.com/tag/cloudinary/)

---

## Dev Setup

1. `npm install`
2. `cp src/config.example.json src/config.json`
3. Edit `config.json`
4. `npm run start`

> This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
