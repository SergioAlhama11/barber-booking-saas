package com.sergio.domain.barbershop.exception;

public class BarbershopDeletionNotAllowedException extends RuntimeException {
  public BarbershopDeletionNotAllowedException() {
    super("Cannot delete barbershop with existing barbers");
  }
}
