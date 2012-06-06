/**
 * @fileOverview Class Test
 * @author Hedger Wang
 *
 * @link http://localhost:8888/jog/class/class_test.html
 */

var Class = require('jog/class').Class;
var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('Class Test'))
  .test('create',
  function() {
    var Foo = Class.create();
    var foo = new Foo();
    asserts.equal(foo.constructor, Foo);
    asserts.isTrue(foo instanceof Foo);
  })
  .test('create with main',
  function() {
    var Foo = Class.create(null, {
      main: function() {
        this.x++;
      },
      x : 0
    });
    var foo = new Foo();
    asserts.equal(foo.constructor, Foo);
    asserts.equal(1, foo.x);
  })
  .test('create with super class',
  function() {
    var SuperClass = Class.create();
    var ChildClass = Class.create(SuperClass);
    var foo = new ChildClass();
    asserts.isTrue(foo instanceof SuperClass);
    asserts.isTrue(foo instanceof ChildClass);
    asserts.equal(foo.constructor, ChildClass);
  })
  .test('create with super class and config',
  function() {
    var SuperClass = Class.create(null, {
      main: function() {
        this.name = 'super';
        this.x++;
      },
      bar: function() {
        this.x = 0;
      },
      x: 0
    });
    var ChildClass = Class.create(SuperClass, {
      main:function() {
        this.name = 'child';
        this.x++;
      }
    });
    var foo = new ChildClass();
    asserts.equal(foo.name, 'child');
    asserts.equal(foo.name, 'child');
    asserts.equal(foo.x, 2);
    asserts.equal(foo.constructor, ChildClass);

    foo.bar();
    asserts.equal(foo.x, 0);
  })
  .test('test override',
  function() {
    var SuperClass = Class.create(null, {
      _x: 0
    });

    asserts.throws(function() {
      Class.create(SuperClass, {
        _x: 'a'
      });
    });

    asserts.throws(function() {
      Class.create(SuperClass, {
        _y: {}
      });
    });
  })
  .test('test life cycle',
  function() {
    var mains = [];
    var disposes = [];
    var Foo0 = Class.create(null, {
      main: function() {
        mains.push(0);

      },
      dispose: function() {
        disposes.push('a');
      }
    });

    var Foo1 = Class.create(Foo0, {
      main: function() {
        mains.push(1);
      }
    });

    var Foo2 = Class.create(Foo1, {
      main: function() {
        mains.push(2);
      }
    });

    var Foo3 = Class.create(Foo2, {
      dispose: function() {
        disposes.push('c');
      }
    });

    var Foo4 = Class.create(Foo3, {
      main: function() {
        mains.push(4);
      },
      dispose: function() {
        disposes.push('d');
      }
    });

    var foo = new Foo4();
    foo.dispose();
    asserts.arrayEqual([0, 1, 2, 4], mains);
    asserts.arrayEqual(["d", "c", "a"], disposes);
  })
  .test('test dispose',
  function() {
    var Foo = Class.create(null, {
      main:function() {
        this.x = 1;
      },
      x: 0
    });
    var foo = new Foo();
    asserts.equal(foo.x, 1);
    asserts.isFalse(!!foo.disposed);
    foo.dispose();
    asserts.equal(foo.x, 0);
    asserts.isTrue(foo.disposed);
  })
  .test('test dispose inheritence',
  function() {
    var Foo = Class.create(null, {
      main:function() {
        this.x = 1;
      },
      x: 0
    });

    var Bar = Class.create(Foo, {
      dispose: function() {
      }
    });

    var bar = new Bar();
    asserts.equal(bar.x, 1);
    asserts.isFalse(!!bar.disposed);
    bar.dispose();
    asserts.equal(bar.x, 0);
    asserts.isTrue(bar.disposed);
  })
  .test('Maximum call stack size  safe',
  function() {
    var Chrome = Class.create();
    var App = Class.create(null, {
      main: function() {
        new Chrome();
      }
    });
    new App();
  })
  .test('bind',
  function() {
    var Klass = Class.create();
    var obj = new Klass();
    obj.x = 0;
    var fn1 = obj.bind(function() {
      this.x++;
    });
    var fn2 = obj.bind(fn1);
    fn1();
    fn2();
    asserts.equal(fn1, fn2);
    asserts.equal(obj.x, 2);
  }
);
