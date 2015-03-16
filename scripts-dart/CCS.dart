/**
 * Content-Caching System
 * Ported to DART
 * Noah Shuart
 */
import 'dart:html';

class CCS {
  List<Map> cntCache = [];
  List<Map> cntCached = [];

  String div;
  List<String> prefetchList;

  CCS([String div = null, List<String> prefetchList = null]) {
    if (div != null) {
      this.div = div;
    } else {
      throw 'A div for content must be provided';
    }

    this.prefetchList = prefetchList;
  }

  void prefetch() {
    if (this.prefetchList != null) {
      this.prefetchList.forEach((e) {
        var req = HttpRequest
          .getString(e)
          .then((String res) {
            // Parse and modify data
          });
      });
    } else {
      throw 'Prefetch URL list not set';
    }
  }

  void load() {

  }

  void __build() {

  }
}