process.mixin(require("mjsunit"));

var geonode = require("./geonode");
var sys = require("sys");

var rss = process.memoryUsage()["rss"];

function assertGeomsEqual(ga, gb) {
    return assertTrue(ga.equals(gb));
}

var Geometry = geonode.Geometry;

var geom = new Geometry();

assertInstanceof(geom, Geometry);

assertTrue(/^3\.[0-9.]+-CAPI-1\.[56]\.[0-9]$/.test(geom._geosVersion));

assertEquals(geom.toWkt(), "");

geom.fromWkt("POINT(0 0)");

// FIXME this kind of string matching can be fragile with WKTs
assertEquals(geom.toWkt(), "POINT (0.0000000000000000 0.0000000000000000)");

// You can also initialize a Geometry with a WKT passed to the constructor
var pt = new Geometry("POINT(1 1)");

assertInstanceof(pt, Geometry);

assertEquals(pt.toWkt(), "POINT (1.0000000000000000 1.0000000000000000)");

var poly = new Geometry("POLYGON((0 0, 0 2, 2 2, 2 0, 0 0))");

polyWkt = "POLYGON ((0.0000000000000000 0.0000000000000000, 0.0000000000000000 2.0000000000000000, 2.0000000000000000 2.0000000000000000, 2.0000000000000000 0.0000000000000000, 0.0000000000000000 0.0000000000000000))";

assertEquals(poly.toWkt(), polyWkt);

assertThrows("new Geometry(\"SOMEGROSSLYINVALIDWKT\")");
assertThrows("var g = new Geometry(); g.fromWkt(\"SOMEGROSSLYINVALIDWKT\")");

assertTrue(poly.contains(pt));
assertFalse(pt.contains(poly));
assertFalse(poly.contains(new Geometry("POINT(3 3)")));

assertTrue(!poly.isEmpty());
assertTrue(new Geometry("POINT EMPTY").isEmpty());

assertTrue(poly.isValid());
assertFalse(new Geometry("POLYGON((0 0, 2 2, 0 2, 2 0, 0 0))").isValid());

assertTrue(poly.isSimple());

assertTrue(poly.intersects(new Geometry("POLYGON((1 1, 1 3, 3 3, 3 1, 1 1))")));
assertFalse(poly.intersects(new Geometry("LINESTRING(3 3, 4 4)")));
assertTrue(poly.intersects(new Geometry("POINT(0 0)")));

poly.srid = 4326;
assertEquals(poly.srid, 4326);

assertEquals(poly.type, "Polygon");
assertEquals(new Geometry("POINT(0 0)").type, "Point");

assertEquals(poly.area, 4);

assertEquals(new Geometry("LINESTRING(0 0, 1 1)").length, Math.sqrt(2));

assertEquals(new Geometry("POINT(0 0)").distance(new Geometry("POINT(1 1)")), Math.sqrt(2));

assertGeomsEqual(new Geometry("POLYGON((0 1, 1 0, 2 1, 1 2, 0 1))").envelope, new Geometry("POLYGON ((0 0, 2 0, 2 2, 0 2, 0 0))"));

assertGeomsEqual(poly.intersection(new Geometry("POLYGON((1 1, 1 3, 3 3, 3 1, 1 1))")), new Geometry("POLYGON((1 2, 2 2, 2 1, 1 1, 1 2))"));

// FIXME needs equalsExact with tolerance argument -- assertGeomsEqual(new Geometry("POINT(1 1)").buffer(1), new Geometry("POLYGON ((2.0000000000000000 1.0000000000000000, 1.9807852804032304 0.8049096779838719, 1.9238795325112870 0.6173165676349106, 1.8314696123025456 0.4444297669803983, 1.7071067811865481 0.2928932188134531, 1.5555702330196031 0.1685303876974553, 1.3826834323650909 0.0761204674887137, 1.1950903220161297 0.0192147195967698, 1.0000000000000016 0.0000000000000000, 0.8049096779838736 0.0192147195967692, 0.6173165676349122 0.0761204674887125, 0.4444297669803995 0.1685303876974537, 0.2928932188134541 0.2928932188134509, 0.1685303876974562 0.4444297669803957, 0.0761204674887143 0.6173165676349077, 0.0192147195967701 0.8049096779838688, 0.0000000000000000 0.9999999999999968, 0.0192147195967689 1.1950903220161249, 0.0761204674887118 1.3826834323650863, 0.1685303876974525 1.5555702330195991, 0.2928932188134495 1.7071067811865446, 0.4444297669803942 1.8314696123025427, 0.6173165676349064 1.9238795325112852, 0.8049096779838678 1.9807852804032295, 0.9999999999999962 2.0000000000000000, 1.1950903220161249 1.9807852804032311, 1.3826834323650867 1.9238795325112881, 1.5555702330195995 1.8314696123025469, 1.7071067811865455 1.7071067811865497, 1.8314696123025438 1.5555702330196044, 1.9238795325112859 1.3826834323650921, 1.9807852804032300 1.1950903220161304, 2.0000000000000000 1.0000000000000000))"));

assertGeomsEqual(new Geometry("POINT(1 1)").buffer(1, 1), new Geometry("POLYGON ((2.0000000000000000 1.0000000000000000, 1.0000000000000016 0.0000000000000000, 0.0000000000000000 0.9999999999999968, 0.9999999999999953 2.0000000000000000, 2.0000000000000000 1.0000000000000000))"));

assertGeomsEqual(new Geometry("POLYGON((1 1, 3 2, 2 1, 3 0, 1 1))").convexHull, new Geometry("POLYGON ((3 0, 1 1, 3 2, 3 0))"));

assertGeomsEqual(poly.difference(new Geometry("POLYGON((1 1, 1 3, 3 3, 3 1, 1 1))")), new Geometry("POLYGON ((0 0, 0 2, 1 2, 1 1, 2 1, 2 0, 0 0))"));

assertGeomsEqual(poly.symDifference(new Geometry("POLYGON((1 1, 1 3, 3 3, 3 1, 1 1))")), new Geometry("MULTIPOLYGON (((0 0, 0 2, 1 2, 1 1, 2 1, 2 0, 0 0)), ((2 1, 2 2, 1 2, 1 3, 3 3, 3 1, 2 1)))"));

assertGeomsEqual(new Geometry("LINESTRING(1 1, 0 0, -1 1)").boundary, new Geometry("MULTIPOINT(1 1, -1 1)"));

assertGeomsEqual(poly.union(new Geometry("POLYGON((1 1, 1 3, 3 3, 3 1, 1 1))")), new Geometry("POLYGON ((0 0, 0 2, 1 2, 1 3, 3 3, 3 1, 2 1, 2 0, 0 0))"));

assertGeomsEqual(poly.pointOnSurface, new Geometry("POINT(1 1)"));

assertGeomsEqual(poly.centroid, new Geometry("POINT(1 1)"));

//////////////////////

var Projection = geonode.Projection;
var lonlat = new Projection("+init=epsg:4326");

// Sanity checks, we're getting good stuff
assertInstanceof(lonlat, Projection);
assertEquals(lonlat.definition, " +init=epsg:4326 +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs +towgs84=0,0,0");

assertThrows('new Projection();');
assertThrows('new Projection("INVALID_PROJECTION");');

assertThrows('Projection.transform();');

// We're going to use the "World Mercator" projection for testing
var worldmerc = new Projection("+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs")

// Test Point Projection
Projection.transform(lonlat, worldmerc, pt);
assertEquals(pt.toWkt(), "POINT (6378137.0000000000000000 7784829.4924453338608146)");

// Test Line Projection
var line = new Geometry("LINESTRING(0 0, 1 1)");
Projection.transform(lonlat, worldmerc, line);
assertEquals(line.toWkt(), "LINESTRING (0.0000000000000000 0.0000000007081155, 6378137.0000000000000000 7784829.4924453338608146)");

// Test Polygon Projection
Projection.transform(lonlat, worldmerc, poly);
assertEquals(poly.toWkt(), "POLYGON ((0.0000000000000000 0.0000000007081155, 0.0000000000000000 2.0000000000000000, 2.0000000000000000 2.0000000000000000, 12756274.0000000000000000 0.0000000007081155, 0.0000000000000000 0.0000000007081155))");

//////////////////////

sys.puts("Heap increased by " + ((process.memoryUsage()["rss"] - rss) / 1024) + " KB");
sys.puts("Tests pass!");
