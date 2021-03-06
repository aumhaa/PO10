# by amounra 0119 : http://www.aumhaa.com

from __future__ import absolute_import, print_function
from ableton.v2.control_surface.capabilities import *
from .PO10 import PO10

def get_capabilities():
	return {CONTROLLER_ID_KEY: controller_id(vendor_id=2536, product_ids=[115], model_name='PO10'),
	 PORTS_KEY: [inport(props=[HIDDEN, NOTES_CC, SCRIPT, REMOTE]),
					inport(props = []),
					outport(props=[HIDDEN, NOTES_CC, SCRIPT, REMOTE]),
					outport(props=[])],
	 TYPE_KEY: 'push',
	 AUTO_LOAD_KEY: False}

def create_instance(c_instance):
    """ Creates and returns the PO10 script """
    return PO10(c_instance)
