import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";




export const register = async (req, res) => {
  const { user_name, password, role_id } = req.body;
  const finalRole = role_id ? role_id : 3;
  const errors = {};

  if (!user_name) errors.user_name = "username is required";
  if (!password) errors.password = "password is required";

  if (Object.keys(errors).length) {
    return res.status(400).json({ success: false, errors });
  }

  const checkUser = "SELECT * FROM selar_user WHERE user_name = ?";
  db.query(checkUser, [user_name], async (err, data) => {
    if (err) {
      return res.status(500).json({ success: false, errors: { database: "Database error" } });
    }
    if (data.length > 0) {
      return res.status(400).json({ success: false, errors: { user_name: "Username already exists" } });
    }

    const hashed = bcrypt.hashSync(password, 10);
    const insertUser = `
      INSERT INTO selar_user (role_id, user_name, password, real_password)
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertUser, [finalRole, user_name, hashed, password], (err2) => {
      if (err2) {
        return res.status(500).json({ success: false, errors: { database: "Database error" } });
      }
      return res.status(201).json({
        success: true,
        message: "User created successfully"
      });
    });
  });
};




export const login = async (req, res) => {
  const { user_name, password } = req.body;

  if (!user_name || !password) {
    return res.status(400).json({
      success: false,
      errors: {
        user_name: !user_name ? "Username is required" : "",
        password: !password ? "Password is required" : "",
      },
    });
  }

  const sql = `
    SELECT selar_user.*, roles.name AS role_name
    FROM selar_user
    LEFT JOIN roles ON selar_user.role_id = roles.id
    WHERE selar_user.user_name = ?
  `;

  db.query(sql, [user_name], (err, data) => {
    if (err) {
      return res.status(500).json({
        success: false, 
        errors: { user_name: "Something went wrong" } 
      });
    }

    if (data.length === 0) {
      return res.status(404).json({ 
        success: false, 
        errors: { user_name: "Username not found" } 
      });
    }

    const user = data[0];

    if (password !== user.real_password) {
      return res.status(401).json({   
        success: false, 
        errors: { password: "Invalid password" } 
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        user_name: user.user_name,
        role_id: user.role_id,
        role_name: user.role_name
      }
    });
  });
};


// //Insert the Product
// export const addProduct = (req, res) => {
//   const { productName, price, discription } = req.body;
//   const seller_id = req.user.id; // ⭐ yahi important part

//   let errors = {};

//   if (!req.file) errors.image = "Image is required";
//   if (!productName) errors.productName = "Product Name is required";
//   if (!price) errors.price = "Price is required";
//   if (!discription) errors.discription = "Discription is required";

//   if (Object.keys(errors).length > 0) {
//     return res.status(400).json({
//       success: false,
//       errors,
//     });
//   }

//   const image = req.file.filename;

//   const sql = `
//     INSERT INTO selerproduct (image, productName, price, discription, seller_id)
//     VALUES (?, ?, ?, ?, ?)
//   `;

//   db.query(sql, [image, productName, price, discription, seller_id], (err) => {
//     if (err) return res.json({ error: err });

//     return res.json({
//       success: true,
//       message: "Product added successfully",
//     });
//   });
// };

//Get all Product
// Get Product
export const getAllProduct = (req, res) => {
  const seller_id = req.user.id; // JWT se seller id

  const sql = "SELECT * FROM selerproduct WHERE seller_id = ?";

  db.query(sql, [seller_id], (err, data) => {
    if (err) return res.json({ error: err });

    return res.json({
      success: true,
      message: "Your products fetched successfully",
      data: data.map((item) => ({
        id: item.id,
        image: item.image,
        productName: item.productName,
        price: item.price,
        discription: item.discription,
        status: item.status
      })),
    });
  });
};

// change




//Insert the Product Updated Value add 
export const addProduct = (req, res) => {
  const { productName, price, discription } = req.body;
  const seller_id = req.user.id;

  let errors = {};

  if (!req.file) errors.image = "Image is required";
  if (!productName) errors.productName = "Product Name is required";
  if (!price) errors.price = "Price is required";
  if (!discription) errors.discription = "Discription is required";

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  const image = req.file.filename;

  const sql = `
    INSERT INTO selerproduct (image, productName, price, discription, seller_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [image, productName, price, discription, seller_id], (err) => {
    if (err) return res.json({ error: err });

    return res.json({
      success: true,
      message: "Product added successfully",
    });
  });
};


export const editProduct = (req, res) => {
  const product_id = req.params.id;
  const { productName, price, discription } = req.body;

  let errors = {};

  if (!productName) errors.productName = "Product Name is required";
  if (!price) errors.price = "Price is required";
  if (!discription) errors.discription = "Description is required";

  // If we have errors
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  // NEW IMAGE (if uploaded)
  let image = null;
  if (req.file) {
    image = req.file.filename;
  }

  // First get old product (to delete old image later)
  const getSql = "SELECT * FROM selerproduct WHERE id = ?";
  db.query(getSql, [product_id], (err, data) => {
    if (err) return res.json({ success: false, error: err });

    if (data.length === 0) {
      return res.json({ success: false, message: "Product not found" });
    }

    const oldImage = data[0].image;

    // If new image uploaded → replace it
    const updateSql = `
      UPDATE selerproduct
      SET productName = ?, price = ?, discription = ?, image = COALESCE(?, image)
      WHERE id = ?
    `;

    db.query(updateSql, [productName, price, discription, image, product_id], (err, result) => {
      if (err) return res.json({ success: false, error: err });

      // Delete old image if new uploaded
      if (image && oldImage) {
        import("fs").then((fs) => {
          const path = `public/products/${oldImage}`;
          if (fs.existsSync(path)) {
            fs.unlinkSync(path);
          }
        });
      }

      return res.json({
        success: true,
        message: "Product updated successfully",
        image: image ? image : oldImage
      });
    });
  });
};



export const getSingleProduct = (req, res) => {
  const product_id = req.params.id;

  const sql = `SELECT * FROM selerproduct WHERE id = ?`;

  db.query(sql, [product_id], (err, data) => {
    if (err) return res.json({ error: err });

    if (data.length === 0) {
      return res.json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      message: "Product fetched successfully",
      product: data[0],
    });
  });
};


export const deleteProduct = (req, res) => {
  const { product_id } = req.body;

  if (!product_id) {
    return res.status(400).json({
      success: false,
      message: "Product ID is required",
    });
  }

  const sql = `DELETE FROM selerproduct WHERE id = ?`;

  db.query(sql, [product_id], (err, result) => {
    if (err) return res.json({ error: err });

    if (result.affectedRows === 0) {
      return res.json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      message: "Product deleted successfully",
    });
  });
};


// Admin Controller

export const getAllProductData = (req, res)=>{
  const sql = "SELECT * FROM selerproduct";
  db.query(sql, (err, data)=>{
    if(err) return res.json({error: err});
    return res.json({
      success: true,
      message: "Products fetched successfully",
      data: data.map((item)=>({
        id: item.id,
        image: item.image,
        productName: item.productName,
        price: item.price,
        discription: item.discription,
        status: item.status
      }))
    })
  })
}





