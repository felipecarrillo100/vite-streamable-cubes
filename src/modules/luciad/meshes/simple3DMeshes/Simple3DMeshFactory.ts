/*
 *
 * Copyright (c) 1999-2025 Luciad All Rights Reserved.
 *
 * Luciad grants you ("Licensee") a non-exclusive, royalty free, license to use,
 * modify and redistribute this software in source and binary code form,
 * provided that i) this copyright notice and license appear on all copies of
 * the software; and ii) Licensee does not utilize the software in a manner
 * which is disparaging to Luciad.
 *
 * This software is provided "AS IS," without a warranty of any kind. ALL
 * EXPRESS OR IMPLIED CONDITIONS, REPRESENTATIONS AND WARRANTIES, INCLUDING ANY
 * IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE OR
 * NON-INFRINGEMENT, ARE HEREBY EXCLUDED. LUCIAD AND ITS LICENSORS SHALL NOT BE
 * LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE AS A RESULT OF USING, MODIFYING
 * OR DISTRIBUTING THE SOFTWARE OR ITS DERIVATIVES. IN NO EVENT WILL LUCIAD OR ITS
 * LICENSORS BE LIABLE FOR ANY LOST REVENUE, PROFIT OR DATA, OR FOR DIRECT,
 * INDIRECT, SPECIAL, CONSEQUENTIAL, INCIDENTAL OR PUNITIVE DAMAGES, HOWEVER
 * CAUSED AND REGARDLESS OF THE THEORY OF LIABILITY, ARISING OUT OF THE USE OF
 * OR INABILITY TO USE SOFTWARE, EVEN IF LUCIAD HAS BEEN ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGES.
 */
import {create3DMesh} from "@luciad/ria/geometry/mesh/MeshFactory.js";
import {Arrow3DMesh} from "./Arrow3DMesh.js";
import {Cylinder3DMesh} from "./Cylinder3DMesh.js";
import {Cone3DMesh} from "./Cone3DMesh.js";
import {Ellipsoid3DMesh} from "./Ellipsoid3DMesh.js";
import {EllipsoidalDome3DMesh} from "./EllipsoidalDome3DMesh.js";
import {Mesh} from "@luciad/ria/geometry/mesh/Mesh.js";

/**
 * Creates a 3D ellipsoid with the given radial dimensions in X, Y, and Z axis, and with the given number of
 * vertical and horizontal subdivisions of the surface.
 *
 * A texture can be optionally applied to the mesh.
 *
 * @param radiusX the radial dimension along the X axis
 * @param radiusY the radial dimension along the Y axis
 * @param radiusZ the radial dimension along the Z axis
 * @param verticalSlicesCount the number of vertical subdivisions of the surface (similar to lines of longitude)
 * @param horizontalSlicesCount the number of horizontal subdivisions of the surface (similar to lines of latitude)
 * @param texture the texture to be applied to the 3D ellipsoid
 **/
export const create3DEllipsoid = (
    radiusX: number,
    radiusY: number,
    radiusZ: number,
    verticalSlicesCount: number,
    horizontalSlicesCount: number,
    texture?: HTMLCanvasElement | HTMLImageElement | string
): Mesh => {
  const ellipsoid3DMesh = new Ellipsoid3DMesh(radiusX, radiusY, radiusZ, verticalSlicesCount, horizontalSlicesCount);
  return texture ? create3DMesh(ellipsoid3DMesh.createVertices(), ellipsoid3DMesh.createIndices(), {
    normals: ellipsoid3DMesh.createNormals(),
    texCoords: ellipsoid3DMesh.createTextureCoordinates(),
    image: texture
  }) : create3DMesh(ellipsoid3DMesh.createVertices(), ellipsoid3DMesh.createIndices(), {
    normals: ellipsoid3DMesh.createNormals()
  });
};

/**
 * Creates a 3D ellipsoidal dome with the given radial dimensions in X, Y, and Z axis, and with the given number of
 * vertical and horizontal subdivisions of the surface.
 *
 * A texture can be optionally applied to the mesh.
 *
 * @param radiusX the radial dimension along the X axis
 * @param radiusY the radial dimension along the Y axis
 * @param radiusZ the radial dimension along the Z axis
 * @param verticalSlicesCount the number of vertical subdivisions of the surface (similar to lines of longitude)
 * @param horizontalSlicesCount the number of horizontal subdivisions of the surface (similar to lines of latitude)
 * @param texture the texture to be applied to the 3D ellipsoidal dome
 **/
export const create3DEllipsoidalDome = (radiusX: number, radiusY: number, radiusZ: number, verticalSlicesCount: number,
                                        horizontalSlicesCount: number,
                                        texture?: HTMLCanvasElement | HTMLImageElement | string): Mesh => {
  const ellipsoidal3DMesh = new EllipsoidalDome3DMesh(radiusX, radiusY, radiusZ, verticalSlicesCount,
      horizontalSlicesCount);
  return texture ? create3DMesh(ellipsoidal3DMesh.createVertices(), ellipsoidal3DMesh.createIndices(), {
    normals: ellipsoidal3DMesh.createNormals(),
    texCoords: ellipsoidal3DMesh.createTextureCoordinates(),
    image: texture
  }) : create3DMesh(ellipsoidal3DMesh.createVertices(), ellipsoidal3DMesh.createIndices(), {
    normals: ellipsoidal3DMesh.createNormals()
  });
};

/**
 * Creates a 3D sphere with the given radius and number of subdivisions of the surface.
 *
 * A texture can be optionally applied to the mesh.
 *
 * @param radius the radius of the sphere
 * @param sliceCount number of vertical and horizontal subdivisions of the surface (similar to lines of
 * longitude and latitude)
 * @param texture the texture to be applied to the 3D Sphere
 **/
export const create3DSphere = (radius: number, sliceCount: number,
                               texture?: HTMLCanvasElement | HTMLImageElement | string): Mesh => create3DEllipsoid(
    radius, radius, radius, sliceCount,
    sliceCount, texture);

/**
 * Creates a 3D dome with the given radius and number of subdivisions of the surface.
 *
 * A texture can be optionally applied to the mesh.
 *
 * @param radius the radius of the sphere
 * @param sliceCount number of vertical and horizontal subdivisions of the surface (similar to lines of
 * longitude and latitude)
 * @param texture the texture to be applied to the 3D Dome
 **/
export const create3DDome = (radius: number, sliceCount: number,
                             texture?: HTMLCanvasElement | HTMLImageElement | string): Mesh => create3DEllipsoidalDome(
    radius, radius, radius, sliceCount,
    sliceCount, texture);

/**
 * Creates a 3D cone with given base and top radius, height and number of subdivisions
 * of the side surface.
 * A higher subdivision number will ensure a smoother appearance of the side surface of the cone.
 *
 * A texture can be optionally applied to the mesh.
 *
 * @param baseRadius the base radius of the cone
 * @param topRadius the top radius of the cone
 * @param height the cone height
 * @param sliceCount the number of subdivisions of the side surface of the cone around the cone main axis
 * @param texture the texture to be applied to the 3D cone
 **/
export const create3DCone = (baseRadius: number, topRadius: number, height: number, sliceCount: number,
                             texture?: HTMLCanvasElement | HTMLImageElement | string): Mesh => {
  const cone3DMesh = new Cone3DMesh(baseRadius, topRadius, height, sliceCount);
  return texture ? create3DMesh(cone3DMesh.createVertices(), cone3DMesh.createIndices(), {
    normals: cone3DMesh.createNormals(),
    texCoords: cone3DMesh.createTextureCoordinates(),
    image: texture
  }) : create3DMesh(cone3DMesh.createVertices(), cone3DMesh.createIndices(), {
    normals: cone3DMesh.createNormals()
  });
};

/**
 * Creates a 3D cylinder mesh. The cylinder is oriented in the Z direction.
 *
 * @param radius the radius of the cylinder
 * @param height the height of the cylinder
 * @param sliceCount the number of slices (subdivisions) of the side surface of the stick and the tip
 * @param texture the texture to be applied to the 3D cylinder
 */
export const create3DCylinder = (radius: number, height: number, sliceCount: number,
                                 texture?: HTMLCanvasElement | HTMLImageElement | string): Mesh => {
  const cylinder3DMesh = new Cylinder3DMesh(radius, height, sliceCount);
  return texture ? create3DMesh(cylinder3DMesh.createVertices(), cylinder3DMesh.createIndices(), {
    normals: cylinder3DMesh.createNormals(),
    texCoords: cylinder3DMesh.createTextureCoordinates(),
    image: texture
  }) : create3DMesh(cylinder3DMesh.createVertices(), cylinder3DMesh.createIndices(), {
    normals: cylinder3DMesh.createNormals()
  });
};

/**
 * Creates a 3D arrow with the given dimensional parameters.
 * A 3D arrow is composed of two parts:
 *   - A stick (cylindrical shape)
 *   - A tip (conic shape)
 *
 * The default orientation is in the direction of the z-axis (i.e. upward).
 *
 * @param stickRadius the radius of the arrow stick
 * @param stickHeight the height of the arrow stick
 * @param tipBaseRadius the radius of the arrow tip's bottom base
 * @param tipTopRadius the radius of the arrow tip's top base
 * @param tipHeight the height of the arrow tip
 * @param sliceCount the number of slices (subdivisions) of the side surface of the stick and the tip
 * @param texture the texture to be applied to the 3D arrow
 */
export const create3DArrow = (
    stickRadius: number,
    stickHeight: number,
    tipBaseRadius: number,
    tipTopRadius: number,
    tipHeight: number,
    sliceCount: number,
    texture?: HTMLCanvasElement | HTMLImageElement | string
): Mesh => {
  const arrow3DMesh = new Arrow3DMesh(stickRadius, stickHeight, tipBaseRadius, tipTopRadius, tipHeight, sliceCount);
  return texture ? create3DMesh(arrow3DMesh.createVertices(), arrow3DMesh.createIndices(), {
    normals: arrow3DMesh.createNormals(),
    texCoords: arrow3DMesh.createTextureCoordinates(),
    image: texture
  }) : create3DMesh(arrow3DMesh.createVertices(), arrow3DMesh.createIndices(), {
    normals: arrow3DMesh.createNormals()
  });
};