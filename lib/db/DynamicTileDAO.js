import db from '@/lib/db/db';
import VectorTile from '@/lib/geo/VectorTile';

const EPSG_3857_MAX = 20037508.3427892;
const EPSG_3857_MIN = -EPSG_3857_MAX;
const EPSG_3857_SIZE = EPSG_3857_MAX - EPSG_3857_MIN;

class DynamicTileDAO {
  static getTileInfo(z, x, y) {
    const bmin = -VectorTile.BUFFER;
    const bmax = VectorTile.EXTENT + VectorTile.BUFFER;
    const tileSize = EPSG_3857_SIZE / Math.pow(2, z);
    const xmin = EPSG_3857_MIN + tileSize * x;
    const xmax = EPSG_3857_MIN + tileSize * (x + 1);
    const ymin = EPSG_3857_MAX - tileSize * (y + 1);
    const ymax = EPSG_3857_MAX - tileSize * y;
    const res = tileSize / VectorTile.EXTENT;
    const fx = 1 / res;
    const fy = -fx;
    const xoff = -xmin * fx;
    const yoff = -ymax * fy;

    return {
      bmin,
      bmax,
      xmin,
      ymin,
      xmax,
      ymax,
      res,
      fx,
      fy,
      xoff,
      yoff,
    };
  }

  static async getCountsFeatures(tileInfo) {
    const sql = `
WITH counts AS ((
  SELECT ac.centreline_id, ac.centreline_type, ad."LOCATION",
  ci."COUNT_INFO_ID", ci."ARTERYCODE", ac.geom
  FROM "TRAFFIC"."COUNTINFO" ci
  JOIN "TRAFFIC"."ARTERYDATA" ad ON ci."ARTERYCODE" = ad."ARTERYCODE"
  JOIN prj_volume.artery_centreline ac ON ci."ARTERYCODE" = ac.arterycode
  WHERE ST_Intersects(
    ST_Transform(ac.geom, 3857),
    ST_MakeEnvelope($(xmin), $(ymin), $(xmax), $(ymax), 3857)
  )
) UNION ALL (
  SELECT ac.centreline_id, ac.centreline_type, ad."LOCATION",
  cim."COUNT_INFO_ID", cim."ARTERYCODE", ac.geom
  FROM "TRAFFIC"."COUNTINFOMICS" cim
  JOIN "TRAFFIC"."ARTERYDATA" ad ON cim."ARTERYCODE" = ad."ARTERYCODE"
  JOIN prj_volume.artery_centreline ac ON cim."ARTERYCODE" = ac.arterycode
  WHERE ST_Intersects(
    ST_Transform(ac.geom, 3857),
    ST_MakeEnvelope($(xmin), $(ymin), $(xmax), $(ymax), 3857)
  )
))
SELECT ST_AsGeoJSON(
  ST_Intersection(
    ST_SnapToGrid(
      ST_Affine(
        ST_Simplify(
          ST_RemoveRepeatedPoints(ST_Transform(geom, 3857), $(res)),
          $(res),
          FALSE
        ),
        $(fx), 0,
        0, $(fy),
        $(xoff), $(yoff)
      ),
      0, 0, 1, 1
    ),
    ST_MakeEnvelope($(bmin), $(bmin), $(bmax), $(bmax), 3857)
  )
)::json AS geom,
"COUNT_INFO_ID" as id,
"ARTERYCODE",
centreline_id,
centreline_type,
"LOCATION"
FROM counts`;
    return db.manyOrNone(sql, tileInfo);
  }

  static async getTileFeatures(layerName, z, x, y) {
    const tileInfo = DynamicTileDAO.getTileInfo(z, x, y);
    if (layerName === 'counts') {
      return DynamicTileDAO.getCountsFeatures(tileInfo);
    }
    // TODO: throw an error here
    return [];
  }
}

export default DynamicTileDAO;
