import ConceptArt from "../model/ConceptArtModel.js";

class ConceptArtController {

  static async getAll(req, res){
    try{
      const art = await ConceptArt.getAll();

      res.status(200).json({
        message: 'List of all concept arts',
        art
      })
    }catch(err){
      res.status(500).json({ message: err.message });
    }
  }

  static async getByCategory(req, res){
    const { category } = req.params;

    try{
      const art = await ConceptArt.getByCategory(category);

      res.status(200).json({
        message: `List of all ${category}s`,
        art
      })
    }catch(err){
      res.status(500).json({ message: err.message });
    }
  }

  static async getById(req, res){
    const { id } = req.params;
    try{
      const art = await ConceptArt.getById(id);

      if(!art){
        return res.status(404).json({ message: 'Concept art not found' });
      }

      res.status(200).json({
        message: 'List of all concept arts',
        art
      })
    }catch(err){
      res.status(500).json({ message: err.message });
    }
  }

  static async getByUser(req, res){
    const { user_id } = req.params;

    try{
      const art = await ConceptArt.getByUser(user_id);

      if(!art){
        return res.status(404).json({ message: 'Concept art not found' });
      }

      res.status(200).json({
        message: 'List of all concept arts',
        art
      })
    }catch(err){
      res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res){
    const { title, description, status, tag, category} = req.body;
    const { user_id } = req.user;

    if(!title){
      return res.status(400).json({ message: 'title is required' });
    }

    try{
      const newArt = await ConceptArt.create({user_id, title, description, status, tag, category});

      res.status(201).json({
        message: 'Concept art created successfully',
        art: newArt
      });
    }catch(err){
      res.status(500).json({ message: err.message });
    }
  }

  static async update(req, res){
    const { id } = req.params;
    const { title, description, status, tag, category } = req.body;
    const fields = {};

    if(title) fields.title = title;
    if(description) fields.description = description;
    if(status) fields.status = status;
    if(tag) fields.tag = tag;
    if(category) fields.category = category;

    try{
      const updatedArt = await ConceptArt.update(id, fields);

      if(!updatedArt){
        return res.status(404).json({ message: 'Concept art not found' });
      }

      res.status(200).json({
        message: 'Concept art updated successfully',
        art: updatedArt
      });
    }catch(err){
      res.status(500).json({ message: err.message });
    }
  }

  static async delete(req, res){
    const { id } = req.params;

    try{
      const deletedArt = await ConceptArt.delete(id);

      if(!deletedArt){
        return res.status(404).json({ message: 'Concept art not found' });
      }

      res.status(200).json({
        message: 'Concept art deleted successfully',
        art: deletedArt
      });
    }catch(err){
      res.status(500).json({ message: err.message });
    }
  }

  
}

export default ConceptArtController;