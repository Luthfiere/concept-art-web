import ArtMedia from "../model/ArtMediaModel.js";
import ConceptArt from "../model/ConceptArtModel.js";

class ArtMediaController {
  static async getByArtId(req, res) {
    try {
      const { art_id } = req.params;

      const media = await ArtMedia.getByArtId(art_id);

      return res.status(200).json({
        message: "List of media for the art",
        data: media,
      });
    } catch (err) {
      console.error("ERROR CONTROLLER:", err);
      return res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res) {
  try {
    const { art_id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "media files are required",
      });
    }

    const art = await ConceptArt.getById(art_id);
    if (!art) {
      return res.status(404).json({
        message: "Concept art not found",
      });
    }

    const mediaData = await Promise.all(
      req.files.map(file =>
        ArtMedia.create({
          art_id,
          media: file.path.replace(/\\/g, '/'),
        })
      )
    );

    return res.status(201).json({
      message: "Media created successfully",
      data: mediaData,
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}


  static async delete(req, res) {
    try {
      const { id } = req.params;

      const deleted = await ArtMedia.delete(id);

      if (!deleted) {
        return res.status(404).json({ message: "Media not found" });
      }

      return res.status(200).json({
        message: "Media deleted successfully",
        data: deleted,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default ArtMediaController;
